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
  dim = params[:dim] || "25x25"
  
  width = dim[/^\d+/,0].to_i
  height = dim[/\d+$/,0].to_i
  
#  puts "Resizing: #{url}"
  data = open(url).read
  imgs = Magick::Image.from_blob(data)
  if imgs[0]
    response['Cache-Control'] = 'max-age=2592000'
    response['access-control-allow-origin'] = "*"
    response['access-control-allow-credentials'] = "true"
    
    img = imgs[0]
    content_type "image/#{img.format.downcase}"
    #img.quality = 60 rescue nil
    img.crop_resized(width, height, Magick::CenterGravity).to_blob
  else
    ""
  end
end
