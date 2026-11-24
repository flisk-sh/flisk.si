#!/usr/bin/env ruby
# Writes _data/pages.yml: the pages of every Flisk product site, for llms.txt. For each product in _data/catalog.yml
# whose site answers, it takes the links the site lists in its own /llms.txt (their titles and sentences) plus every URL in
# its /sitemap.xml, reading each page's <title> and meta description. Run it when a product adds pages:
#   ruby scripts/build_pages.rb
# Needs network. Job postings (jobs.flisk.si) are skipped: they come and go. Nothing here is a secret or an account.
require "yaml"
require "net/http"
require "uri"
require "cgi"

SKIP_HOSTS = %w[jobs.flisk.si helpdock.flisk.si].freeze
MAX_PER_SITE = 200

def get(url, limit = 3)
  uri = URI(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = uri.scheme == "https"
  http.open_timeout = 8
  http.read_timeout = 12
  res = http.get(uri.request_uri, "User-Agent" => "flisk.si-llms-builder")
  return get(URI.join(url, res["location"]).to_s, limit - 1) if res.is_a?(Net::HTTPRedirection) && limit > 0
  res.is_a?(Net::HTTPSuccess) ? res.body.to_s.force_encoding("UTF-8") : nil
rescue StandardError
  nil
end

def clean(s)
  CGI.unescapeHTML(s.to_s).gsub(/\s+/, " ").strip
end

def norm(u)
  u.sub(/#.*/, "").sub(%r{/\z}, "")
end

catalog = YAML.load_file(File.join(__dir__, "..", "_data", "catalog.yml"))
sites = {}
catalog["sections"].each do |s|
  s["items"].each do |i|
    host = URI(i["url"]).host
    next unless host.end_with?(".flisk.si") || host == "flisk.sh"
    next if SKIP_HOSTS.include?(host)
    sites[host] ||= i["name"]
  end
end

out = {}
sites.each do |host, name|
  base = "https://#{host}"
  pages = []
  seen = {}
  add = lambda do |title, url, text|
    k = norm(url)
    return if seen[k] || url =~ /[?]/
    seen[k] = true
    pages << { "title" => title, "url" => url, "text" => text.to_s }
  end
  llms = get("#{base}/llms.txt")
  if llms && llms !~ /<html/i
    llms.scan(/^\s*[-*] \[([^\]]+)\]\((https?:[^)\s]+)\)(?::\s*(.*))?$/) { |t, u, d| add.call(clean(t), u, clean(d)) }
  end
  map = get("#{base}/sitemap.xml")
  if map
    map.scan(%r{<loc>\s*([^<\s]+)\s*</loc>}).flatten.first(MAX_PER_SITE).each do |u|
      u = CGI.unescapeHTML(u)
      next if seen[norm(u)] || URI(u).host != host
      html = get(u)
      next unless html
      title = clean(html[%r{<title[^>]*>(.*?)</title>}m, 1])
      desc = clean(html[/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i, 1] || html[/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, 1])
      add.call(title.empty? ? u : title, u, desc)
    end
  end
  next if pages.size < 2
  out[host] = { "name" => name, "pages" => pages }
  warn "#{host}: #{pages.size} pages"
end

File.write(File.join(__dir__, "..", "_data", "pages.yml"),
           "# Written by scripts/build_pages.rb. Do not edit by hand; run the script.\n" + out.to_yaml.sub(/\A---\n/, ""))
