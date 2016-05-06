var marked = require('marked')
var flavors = require('markdown-flavor-maker')
var lookup = require('mime-types').lookup

var msg = require('jssb-ref')

marked.setOptions({
  smartyPants: true, 
  sanitize: true
})

var noop = function(){}

module.exports = function(text, cb){
  cb = cb || noop
  var flavor = flavors()
  flavor.bracketize('<img src=', '>', '<span data-halp="true" data-src=', '></span>')
  var val = text 
  var dummy = document.createElement('div')
  dummy.innerHTML = flavor.render(marked(val))
  var alts = dummy.querySelectorAll('[data-halp=true]')
  alts = Array.prototype.map.call(alts, function(e){
    var src = e.dataset['src']
    var ext = src.slice('.')[-1]
    var match
    if(ext==='sha256'){
      match = 'sha256'
    }
    else{
      match = lookup(src)
    }
    if(match) match = match.match('(audio|video|image|html|sha256)\/*')
    var type = null
    if(match) type = match[1] === 'image' ? 'img' : match[1]
    if(match) type = match[1] === 'html' ? 'iframe' : match[1]
    if(type){
      var node = document.createElement(type)
      node.src = src
      if(type === 'video' || type === 'audio') node.controls = true
      if(match[1] === 'sha256'){
        cb(node)
      }
      return [e, node]
    }
    else return false
  }).filter(Boolean).forEach(function(e){
    e[0].parentNode.replaceChild(e[1], e[0])
  })
  return dummy.innerHTML.toString()
  
}


