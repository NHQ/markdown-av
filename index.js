var marked = require('marked')
var flavors = require('markdown-flavor-maker')
var lookup = require('mime-types').lookup

var msg = require('jssb-ref')

marked.setOptions({
  smartyPants: true, 
  sanitize: true
})


module.exports = function(text){

  var flavor = flavors()
  flavor.bracketize('<img src=', '>', '<span data-halp="true" data-src=', '></span>')
  var val = text 
  var dummy = document.createElement('div')
  dummy.innerHTML = flavor.render(marked(val))
  var alts = dummy.querySelectorAll('[data-halp=true]')
  alts = Array.prototype.map.call(alts, function(e){
    var src = e.dataset['src']
    var ext = src.slice('.')[-1]
    var match = lookup(src).match('(audio|video|image|html)\/*')
    var type = null
    if(match) type = match[1] === 'image' ? 'img' : match[1]
    if(match) type = match[1] === 'html' ? 'iframe' : match[1]
    if(type){
      var node = document.createElement(type)
      node.src = src
      if(type === 'video' || type === 'audio') node.controls = true
      return [e, node]
    }
    else return false
  }).filter(Boolean).forEach(function(e){
    e[0].parentNode.replaceChild(e[1], e[0])
  })
  return dummy.innerHTML.toString()
  
}


