#!/usr/bin/env ruby
# Checks the free API key entry of the shared bar. assets/bar.js is loaded by every Flisk site, so this runs on the
# built file (_site/assets/bar.js) when it exists, else on the source. It checks that:
#   - the link goes to inference.flisk.si/?section=keys with utm_source (this page's host), utm_medium=bar, utm_campaign=free-key,
#   - the entry is left out on inference.flisk.si itself,
#   - the compact bar hides the pill and shows the same entry in the Products menu,
#   - the Dutch and German bars have the label.
# Usage: ruby scripts/check_bar.rb
path = File.exist?('_site/assets/bar.js') ? '_site/assets/bar.js' : 'assets/bar.js'
src = File.read(path, encoding: 'UTF-8')
errors = []
check = ->(ok, msg) { errors << msg unless ok }

check.(src.include?("https://inference.flisk.si/?section=keys&utm_source=${encodeURIComponent(here)}&utm_medium=bar&utm_campaign=free-key"),
       'the free key link must be https://inference.flisk.si/?section=keys&utm_source=${encodeURIComponent(here)}&utm_medium=bar&utm_campaign=free-key')
check.(src.match?(/here === 'inference\.flisk\.si' \? ''/), 'the free key entry must be left out on inference.flisk.si')
check.(src.include?("!('freeKey' in OPT)"), 'the key entry must be opt-in through data-free-key')
check.(src.scan("t('Get a free API key')").size >= 2, 'the pill and the Products menu item must both use the translated label')
check.(src.include?('keyItem}'), 'the Products menu must carry the free key item')
check.(src.include?('.every-link, .key { display: none; }'), 'the pill must be hidden on a phone')
check.(src.include?('nav.tight .key { display: none; }') || src.include?('nav.tight .key {'), 'the pill must be hidden on the compact (.tight) bar')
check.(src.scan(/\.item\.keyitem \{ display: flex; \}/).size >= 2, 'the Products menu item must show on the phone bar and on the .tight bar')
%w[nl de].each do |lang|
  check.(src.match?(/^\s*#{lang}: \{.*?'Get a free API key': '[^']+'/m), "the #{lang} bar words must translate 'Get a free API key'")
end

if errors.empty?
  puts "ok: free key entry in #{path}"
else
  puts errors.map { |e| "FAIL: #{e}" }
  exit 1
end
