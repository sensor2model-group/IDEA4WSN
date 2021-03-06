/**
 * 
 * Código encontrado em: http://jsfiddle.net/vinodlouis/pb6EM/1/
 * 
 **/

var $currentTab;
var $tabToRemove;

// ---------------------------------------------------
// --------------------------------------------------- INICIALIZACAO
// ---------------------------------------------------

$(function () {
    //when ever any tab is clicked this method will be call
    $("#myTab").on("click", "a", function (e) {
        e.preventDefault();

        $(this).tab( 'show' );
        $currentTab = $(this);
    });

    //configurar o DIALOG quando fechar uma aba
    $( "#dialog-tabClose" ).dialog({
        autoOpen : false,
        resizable: false,
        height   : 200  ,
        modal    : true ,
        
        buttons: {
            "Save": function() {
                removeTab( $tabToRemove , true );
                $( this ).dialog( "close" );
            } ,
            "Close": function() {
                removeTab( $tabToRemove , false );
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    registerCloseEvent();
    
    $( "#buttonSaveFile" ).click( saveTabSelected );
    $( "#buttonSuggestions" ).click( showSuggestions );
});

//this method will register event on close icon on the tab..
function registerCloseEvent()
{
    $( ".closeTab" ).click(function ()
    {
        $tabToRemove = $(this).parent();             //close the tab whose close icon is clicked
        
        if( tab_isValueChanged( $tabToRemove ) )
        {
            $( "#dialog-tabClose" ).dialog( "open" );
        }
        else
        {
            removeTab( $tabToRemove , false );
        }
    });
}

// ---------------------------------------------------
// --------------------------------------------------- FUNCTIONS RELACIONADAS COM ABRIR UM ARQUIVO
// ---------------------------------------------------

function openFile( name , path )
{
    var tabId = "tab_" + changePathToId( path ); //this is id on tab content div where the 
    
    var tabTitle = '<li>';
    tabTitle += '<a href="#' + tabId + '">';
    tabTitle += '<button class="close closeTab" type="button" >×</button>'+ name +'</a></li>';

    $('.nav-tabs').append( tabTitle );
    $('.tab-content').append('<div class="tab-pane" id="' + tabId + '"></div>');

    var urlPath = "/IDEA4WSN/storage/" + $project_storage + "/file?path=";
    craeteNewTabAndLoadUrl( "" , urlPath + path , "#" + tabId );

    showTab( tabId );
    registerCloseEvent();
};

function saveFile( path , conteudo )
{
    // Enviar o conteudo e o caminho do arquivo para o servidor
    $.post( "/IDEA4WSN/storage/" + $project_storage + "/file/save" 
          , { file: path , data: conteudo } )
      .done( function() {       //Caso seja enviado com sucesso!
        notification( "The file was saved." , "success" );
      })
      .fail(function() {        //Caso tenha alguma falha no processo!
        notification( "The file was not saved." , "error" );
      });
}

// ---------------------------------------------------
// --------------------------------------------------- FUNCTIONS WITH FILE
// ---------------------------------------------------

function changePathToId( path )
{
    var id = "";
    
    for( var number in path )
    {
        var c = path.charAt( number );
        
        if( c === '/' )
        {
            id += "dDd";
        }
        else if( c === '.' )
        {
            id += "eEe";
        }
        else if( isDigit( c ) || isLetter( c ) )
        {
            id += c;
        }
    }
    
    return id.replace( "." , "eEe" );
}

//shows the tab with passed content div id..paramter tabid indicates the div 
//where the content resides
function showTab( tabId )
{
    $currentTab = $('#myTab a[href="#' + tabId + '"]');
    $currentTab.tab( 'show' );
}
//return current active tab
function getCurrentTab()
{
    return currentTab;
}

//This function will create a new tab here and it will load the url content in tab content div.
function craeteNewTabAndLoadUrl(parms, url, loadDivSelector)
{
    $("" + loadDivSelector).load(url, function (response, status, xhr) {
        if (status == "error") {
            var msg = "Sorry but there was an error getting details ! ";
            $("" + loadDivSelector).html(msg + xhr.status + " " + xhr.statusText);
            $("" + loadDivSelector).html("Load Ajax Content Here...");
        }
    });
}

//this will return element from current tab
//example : if there are two tabs having  textarea with same id or same class name 
//          then when $("#someId") whill return both the text area from both tabs
//to take care this situation we need get the element from current tab.
function getElement( selector )
{
    var tabContentId = $currentTab.attr( "href" );
    return $("" + tabContentId).find( "" + selector );

}

/**
 * Remove a aba atual aberta!
 * 
 */
function removeCurrentTab()
{
    $tabToRemove = $currentTab;
    $( "#dialog-tabClose" ).dialog( "open" );
}

/**
 * Remove a aba TAB e Salva o arquivo
 * 
 * @param {node} tab
 * @param {boolean} isSaveFile
 */
function removeTab( tab , isSaveFile )
{
    var tabContentId = tab.attr( "href" );
    
    //Primeiro, salva o arquivo
    if( isSaveFile )
    {
        var tabData = $( tabContentId + "_data" )[0];
        var path    = $( tabData ).attr( "file" );    // Caminho imaginario do arquivo
        
        var e  = jQuery.Event( "saveFile" );
        e.path = path;
        
        $( tabContentId + "_data" ).trigger( e );      // save event
    }
    
    //Depois, remove a aba
    tab.parent().remove();              // Remove li of tab
    $('#myTab a:last').tab( 'show' );   // Select first tab
    $( tabContentId ).remove();         // Remove respective tab content
}

function saveTabSelected()
{
    if( !$currentTab )
    {
        notification( "Please, select a tab!" , "warn" );
        return ;
    }
    
    var tabContentId = $currentTab.attr( "href" );
    
    var tabData = $( tabContentId + "_data" )[0];
    var path    = $( tabData ).attr( "file" );    // Caminho imaginario do arquivo

    var e  = jQuery.Event( "saveFile" );
    e.path = path;

    $( tabContentId + "_data" ).trigger( e );      // save event
}

function tab_isValueChanged( tab )
{
    var tabContentId = tab.attr( "href" );
    
    var e  = jQuery.Event( "isValueChanged" );
    e.result = false;
    
    $( tabContentId + "_data" ).trigger( e );
    
    return e.result;
}

// -----------------------------------
// ----------------------------------- SUGGESTIONS
// -----------------------------------

function showSuggestions()
{
    if( !$currentTab )
    {
        notification( "Please, select a tab!" , "warn" );
        return ;
    }
    
    var tabContentId = $currentTab.attr( "href" );
    
    var tabData = $( tabContentId + "_data" )[0];
    var path    = $( tabData ).attr( "file" );

    var $URL = href="/IDEA4WSN/storage/"+ $project_storage +"/file/suggestions?file=" + path;
    showDialogUrl( $URL );
}