# frozen_string_literal: true

# Checks the Dutch and German strings in _data/i18n and, with --built, the pages Jekyll made from them.
#   ruby scripts/check_i18n.rb            data files only
#   ruby scripts/check_i18n.rb --built    also the built _site (run after `bundle exec jekyll build`)
# An item with no translation is allowed (the page falls back to English) and is only counted; a translation for a url that is
# no longer in catalog.yml, a missing section, or a missing interface string fails.
require "yaml"

root = File.expand_path("..", __dir__)
LANGS = %w[nl de].freeze
UI_KEYS = %w[skip home_label nav_label nav_cli nav_docs hero_before hero_after filter_label filter_placeholder sections_label empty foot_text foot_edit language].freeze
errors = []

catalog = YAML.safe_load(File.read(File.join(root, "_data/catalog.yml")))
sections = catalog["sections"]
urls = sections.flat_map { |s| s["items"].map { |i| i["url"] } }

LANGS.each do |lang|
  t = YAML.safe_load(File.read(File.join(root, "_data/i18n/#{lang}.yml")))
  errors << "#{lang}: code must be #{lang}" unless t["code"] == lang
  %w[name title description og_alt].each { |k| errors << "#{lang}: missing #{k}" unless t[k].is_a?(String) && !t[k].strip.empty? }
  UI_KEYS.each { |k| errors << "#{lang}: ui.#{k} missing" unless t.dig("ui", k).is_a?(String) && !t["ui"][k].strip.empty? }
  %w[filter_label empty].each { |k| errors << "#{lang}: ui.#{k} needs %d" unless t.dig("ui", k).to_s.include?("%d") }
  sections.each do |s|
    st = t.dig("sections", s["id"])
    errors << "#{lang}: section #{s["id"]} needs title and text" unless st.is_a?(Hash) && st["title"].to_s.strip != "" && st["text"].to_s.strip != ""
  end
  (t["sections"] || {}).each_key { |id| errors << "#{lang}: section #{id.inspect} is not in catalog.yml" unless sections.any? { |s| s["id"] == id } }
  items = t["items"] || {}
  items.each do |url, text|
    errors << "#{lang}: translation for #{url} but catalog.yml has no such url" unless urls.include?(url)
    errors << "#{lang}: empty text for #{url}" unless text.is_a?(String) && !text.strip.empty?
  end
  missing = urls - items.keys
  puts "#{lang}: #{items.size}/#{urls.size} item texts translated#{missing.empty? ? "" : " (#{missing.size} fall back to English)"}"
end

if ARGV.include?("--built")
  site = File.join(root, "_site")
  { "en" => "index.html", "nl" => "nl/index.html", "de" => "de/index.html" }.each do |lang, path|
    file = File.join(site, path)
    unless File.file?(file)
      errors << "built: #{path} is missing"
      next
    end
    html = File.read(file)
    errors << "built #{path}: <html lang=\"#{lang}\"> missing" unless html.include?("<html lang=\"#{lang}\">")
    %w[en nl de x-default].each { |h| errors << "built #{path}: hreflang #{h} missing" unless html.include?("hreflang=\"#{h}\"") }
    canon = lang == "en" ? "https://flisk.si/" : "https://flisk.si/#{lang}/"
    errors << "built #{path}: canonical should be #{canon}" unless html.include?("rel=\"canonical\" href=\"#{canon}\"")
    errors << "built #{path}: language switcher missing" unless html.scan('data-lang="').size == 3
    errors << "built #{path}: unrendered Liquid or %d left over" if html.include?("{{") || html.include?("%d")
  end
  map = File.read(File.join(site, "sitemap.xml"))
  %w[https://flisk.si/ https://flisk.si/nl/ https://flisk.si/de/].each { |u| errors << "built sitemap.xml: #{u} missing" unless map.include?("<loc>#{u}</loc>") }
end

if errors.empty?
  puts "i18n: ok"
else
  puts errors.map { |e| "FAIL: #{e}" }
  exit 1
end
