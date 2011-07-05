require 'sinatra'

get '/' do
  File.read('public/index.html')
end

get '/cache.manifest' do
  puts "Sintra cache manifest"
  contents = File.read('public/cache.manifest.source')
  if ENV['DEBUG']
    puts "Rotating manifest"
    contents.gsub!(/# Version: [\d\.]+/,"# Version: #{Time.now.to_i / 10}")
  end

  content_type 'text/cache-manifest', :charset => 'utf-8'
  contents
end

