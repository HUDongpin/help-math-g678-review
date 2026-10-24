require 'rexml/document'
require 'json'
allowed = %w[svg g path defs linearGradient radialGradient stop]
rows = ARGV.map do |file|
  raw = File.read(file)
  raise 'DTD forbidden' if raw.match?(/<!DOCTYPE|<!ENTITY/i)
  doc = REXML::Document.new(raw)
  raise 'Not SVG' unless doc.root.name == 'svg'
  ([doc.root] + REXML::XPath.match(doc, '//*')).uniq.each do |element|
    raise "Unsupported SVG element #{element.name}" unless allowed.include?(element.name)
    element.attributes.each_attribute do |attribute|
      raise 'Event handler forbidden' if attribute.name.match?(/^on/i)
      raise 'External href forbidden' if attribute.name == 'href' && !attribute.value.start_with?('#')
      attribute.value.scan(/url\(([^)]+)\)/).each { |m| raise 'External URL forbidden' unless m[0].start_with?('#') }
    end
  end
  children = doc.root.elements.to_a
  groups = children.select { |element| element.name == 'g' }
  raise "Expected one normalization group: #{file}" unless groups.length == 1 && children.all? { |element| %w[g defs].include?(element.name) }
  transform = groups[0].attributes['transform']
  match = transform.match(/^matrix\(([^)]+)\)$/)
  raise 'Missing normalization matrix' unless match
  matrix = match[1].split(/[,\s]+/).map { |n| Float(n) }
  raise 'Nontranslation normalization' unless matrix.length == 6 && matrix.take(4) == [1.0,0.0,0.0,1.0]
  width = Float(doc.root.attributes['width'].sub(/px$/, ''))
  height = Float(doc.root.attributes['height'].sub(/px$/, ''))
  raise 'Invalid bounds' unless width.finite? && height.finite? && width > 0 && height > 0
  {file:file,width:width,height:height,originX:-matrix[4],originY:-matrix[5],svg:doc.root.to_s}
end
puts JSON.generate(rows)
