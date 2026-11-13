# frozen_string_literal: true

# Checks _data/catalog.yml before it goes live on every Flisk site through assets/bar.js:
# the YAML parses, every item has a name, url and text, and every `icon:` names a file in assets/icons.
#   ruby scripts/check_catalog.rb
require "yaml"

root = File.expand_path("..", __dir__)
errors = []

begin
  catalog = YAML.safe_load(File.read(File.join(root, "_data/catalog.yml")))
rescue Psych::Exception => e
  abort "catalog.yml does not parse: #{e.message}"
end

sections = catalog.is_a?(Hash) ? catalog["sections"] : nil
abort "catalog.yml has no `sections` list" unless sections.is_a?(Array) && !sections.empty?

sections.each do |section|
  items = section["items"]
  errors << "section #{section["id"].inspect} has no items" unless items.is_a?(Array) && !items.empty?
  Array(items).each do |item|
    label = "#{section["id"]}/#{item.is_a?(Hash) ? item["name"] : item.inspect}"
    unless item.is_a?(Hash)
      errors << "#{label}: item is not a mapping"
      next
    end
    %w[name url text].each do |key|
      errors << "#{label}: missing #{key}" unless item[key].is_a?(String) && !item[key].strip.empty?
    end
    errors << "#{label}: url must start with https://" if item["url"].is_a?(String) && !item["url"].start_with?("https://")
    icon = item["icon"]
    if icon.nil?
      errors << "#{label}: missing icon"
    elsif !File.file?(File.join(root, "assets/icons", "#{icon}.svg"))
      errors << "#{label}: assets/icons/#{icon}.svg does not exist"
    end
  end
end

# The shared bar names its flagship and menu items by name, so each name must match exactly one catalog item.
names = sections.flat_map { |s| Array(s["items"]).map { |i| i.is_a?(Hash) ? i["name"] : nil } }.compact
bar = catalog["bar"]
if !bar.is_a?(Hash) || !bar["first"].is_a?(String) || !bar["menus"].is_a?(Array) || bar["menus"].empty?
  errors << "bar: needs `first` (an item name) and a non-empty `menus` list"
else
  ([bar["first"]] + bar["menus"].flat_map { |m| Array(m["items"]) }).each do |name|
    count = names.count(name)
    errors << "bar: #{name.inspect} matches #{count} catalog items, needs exactly 1" unless count == 1
  end
  bar["menus"].each { |m| errors << "bar: a menu has no label" unless m["label"].is_a?(String) && !m["label"].empty? }
end

if errors.empty?
  puts "catalog.yml: #{sections.sum { |s| s["items"].size }} items, all icons exist."
else
  puts errors.map { |e| "FAIL: #{e}" }
  exit 1
end
