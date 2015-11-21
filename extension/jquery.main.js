; (function($) {

var extension_name = "Stream on peerflix";
var base_url = "http://127.0.0.1:8783";
var actions = {};
var parent_menu;
var DEBUG = 0;   // set to '1' to see console logging
var logger = function() { if (DEBUG) console.log.apply(console,arguments); };


$(document).ready(function() {
    init_background_page();
});


function init_background_page()
{
  // Create a default context menu with the "refresh" menu item,
  // in case the server is brought up *after* the extension is launched.

  setup_context_menu(null);
  populate_context_menu();
}


function populate_context_menu()
{
  // Ajax to get the shellac.json config data.
  // Clear the current context menu for this extension,
  // then rebuild the context menu from scratch.

  ajax('/config/', {}, {
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      chrome.contextMenus.removeAll( function() {
        parent_menu = null;
        refresh_menuitem = null;
        actions = [];
        setup_context_menu(data);
      });
    }
  });
}


function setup_context_menu(config)
{
  // Create the parent menu item.

  parent_menu = chrome.contextMenus.create({
    title: extension_name,
    contexts: ['link']
  });

  // Create the shell commands.

  if (config != null)
  {
    $.each( config.actions, function(i,action) {
      var child_menu = chrome.contextMenus.create({
        title: action.title,
        onclick: context_onclick,
        parentId: parent_menu,
        contexts: ['link']
      });
      actions[child_menu] = action;
    });
  }
}


function context_onclick( info, tab )
{
  var action = actions[ info.menuItemId ];
  var data = { action: action.name };
  $.each( info, function(k,v) { data["info."+k] = v; } );
  $.each( tab, function(k,v) { data["tab."+k] = v; } );
  ajax('/action/', data, { type:'POST' });
}


function ajax( uri, data, opts )
{
  if (uri == null)
    uri = '/';
  if (opts == null)
    opts = {};

  var defaults = {
    type: 'GET',
    url: base_url+uri,
    data: data,
    dataType: 'html',
    success: function(data) {
      logger("ajax success");
    },
    error: function(xhr,textStatus) {
      logger("ajax error:",xhr);
    }
  };

  $.ajax($.extend({},defaults,opts));
}


})(jQuery);

