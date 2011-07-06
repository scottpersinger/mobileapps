require 'sinatra'
require 'rest-open-uri'
require "RMagick"

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

get '/resize' do
  url = params[:url]
  puts "Resizing: #{url}"
  data = open(url).read
  imgs = Magick::Image.from_blob(data)
  if imgs[0]
    img = imgs[0]
    content_type "image/#{img.format.downcase}"
    img.orig.crop_resized(25, 25, Magick::CenterGravity).to_blob
  else
    ""
  end
end
