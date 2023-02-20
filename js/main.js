function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCaretCharacterOffsetWithin(element) {
	
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
		
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
	
    return caretOffset;
}

function removeEntity(identifier){
	$('[data-entity-id-marked="'+identifier+'"]')[0].outerHTML = $('[data-entity-id-marked="'+identifier+'"]')[0].innerHTML;
	$('[data-entity-id-JSON="'+identifier+'"]')[0].outerHTML = "";
}


function RefreshData(){
	var annotationRawData = localStorage.getItem("spacy-annotation-raw-data");
	
	if(annotationRawData == null){
		localStorage.setItem("spacy-annotation-raw-data","");
		annotationRawData = ""
	}
	var annotationCompletedData = localStorage.getItem("spacy-annotation-completed-data");
	console.log("spacy-annotation-complete-data", annotationCompletedData)
	if (annotationCompletedData != null) {
	var url = 'http://127.0.0.1:5000/annotate';
	console.log(annotationCompletedData)
	fetch(url, {
		method: "POST",
		
		body: JSON.stringify({
			line : annotationCompletedData
		}),
		headers: {
			"Content-type":"application/json; charset=UTF-8"
		}
	})
	.then((res)=>{
		console.log(res.json)
	
	if(annotationCompletedData == null){
		localStorage.setItem("spacy-annotation-completed-data","");
		annotationCompletedData = ""
	}
	var numberOfSamples = localStorage.getItem("spacy-annotation-sample-count");
	if(numberOfSamples == null || numberOfSamples == 0){
		localStorage.setItem("spacy-annotation-sample-count","");
		numberOfSamples = 1;
	}
	$("#annotation-text").html(annotationRawData);
	$("#completed-data-div").html(annotationCompletedData);
	$("#annotation-ner").html(localStorage.getItem("spacy-annotation-entity-names"));
})
}
else{
	if(annotationCompletedData == null){
		localStorage.setItem("spacy-annotation-completed-data","");
		annotationCompletedData = ""
	}
	var numberOfSamples = localStorage.getItem("spacy-annotation-sample-count");
	if(numberOfSamples == null || numberOfSamples == 0){
		localStorage.setItem("spacy-annotation-sample-count","");
		numberOfSamples = 1;
	}
	$("#annotation-text").html(annotationRawData);
	$("#completed-data-div").html(annotationCompletedData);
	$("#annotation-ner").html(localStorage.getItem("spacy-annotation-entity-names"));

}}

function prepareJSONData(){
	$(".JSONdelete").html("");
	var JSONOutContents = $("#JSON-out").text();
	JSONOutContents = JSONOutContents.substring(0, JSONOutContents.length - 1);
	var annotationSentence = localStorage.getItem("spacy-annotation-raw-data")
	var JSONData = "(\""+annotationSentence+"\",{\"entities\":["+JSONOutContents+"]}),";
	return(JSONData);
}

async function save_export(){
	
	var url = 'http://127.0.0.1:5000/save_export';
		fetch( url, {method:"GET"})
		.then(res => res.json())
		.then(data => {
			
			$("#completed-data-div").html("");
			$("#JSON-out").html("")
			$("#raw-data-div").html("");
			$("#annotation-text").html("");
			localStorage.clear();
		})
		.catch(errorMsg => {console.log(errorMsg);})
}

$(document).ready(function(){
	$("#completed-data-div").html("");
	$("#JSON-out").html("")
	$("#raw-data-div").html("");
	$("#annotation-text").html("");
	localStorage.clear();
	
	// RefreshData();
	$("#add-entity-button").on("click",function(){
		var entityNameValue = $("#add-entity-value").val();
		$("#annotation-ner").append("<button class = 'ner-button' style='background-color:rgb("+getRandomInt(128,255)+","+getRandomInt(128,255)+","+getRandomInt(128,255)+");'>"+entityNameValue+"</div>");
		localStorage.setItem("spacy-annotation-entity-names",$("#annotation-ner").html());
		$("#add-entity-value").val("")
		// RefreshData();
	});
	$(document).on("click",".ner-button",function(){
		var entityText = window.getSelection().toString();
	
		var entityTextLength = entityText.length;
		var entityType = this.innerHTML;
		sel = window.getSelection();
	
		if (sel.rangeCount) {
			var entityID = Math.round(Math.random()*1000000000000).toString();
			caretPos = getCaretCharacterOffsetWithin(document.getElementById("annotation-text"));
			nodeText = "<div id='ner-div' data-entity-id-marked = '"+entityID+"' style='background-color:"+this.style.backgroundColor+"'>"+entityText+"</div>";
			document.execCommand("insertHTML",false,nodeText);
		}
		var entityStartPosition = caretPos - (entityTextLength);
		var entityEndPosition = caretPos;
		console.log("Start/End", entityText,(entityStartPosition),entityEndPosition);
		$("#JSON-out").append("<div data-entity-id-JSON = '"+entityID+"' class='entity-JSON' style='background-color:"+this.style.backgroundColor+"'>("+(entityStartPosition)+","+entityEndPosition+",\""+entityType+"\"),<div data-entity-id-jsonx = '"+entityID+"' class='JSONdelete'>x</div></div>");
	});
	$(document).on("dblclick","#ner-div",function(){
		removeEntity($(this).data("entity-id-marked"));
	});
	$(document).on("click",".JSONdelete",function(){
		removeEntity($(this).data("entity-id-jsonx"));
	});
	// $("#raw-data-div").bind("paste",function(e){
	// 	var pastedData = e.originalEvent.clipboardData.getData('text');
	// 	e.preventDefault();
	// 	//alert(pastedData);
	// 	rawDataArray = pastedData.split("\n");
	// 	var numberOfSamples = rawDataArray.length;
	// 	localStorage.setItem("spacy-annotation-sample-count",numberOfSamples);
	// 	preparedRawData = "";
	// 	rawDataArray.forEach(function(rawData){
	// 		preparedRawData += "<div class = 'raw-data-row'>"+rawData.replace(/[^\x00-\x7F]/g, "").replace(/\"/g,"")+"</div>"
	// 	});
	// 	localStorage.setItem("spacy-annotation-raw-data",preparedRawData);
	// 	$("#raw-data-div").html(localStorage.getItem("spacy-annotation-raw-data"));
	// 	//$("#annotation-text").html($(".raw-data-row:first-child").html());
	// 	RefreshData();
	// });
	$("#mark-complete-button").on("click",function(){
		
		localStorage.setItem("spacy-annotation-completed-data",prepareJSONData());
		$(".raw-data-row:first-child").remove();
		$("#JSON-out").html("");
	
		RefreshData();
	});
	$('#get-record-button').on('click', function(){
		
		$("#completed-data-div").html("");
		var url = 'http://127.0.0.1:5000/data';
		fetch( url, {method:"GET"})
		.then(res => res.json())
		.then(data => {
			// rawDataArray = data.text.split("\n");
			// var numberOfSamples = rawDataArray.length;
			localStorage.setItem("spacy-annotation-sample-count",data.total_records);
			// preparedRawData = "";
			// rawDataArray.forEach(function(rawData){
			// 	preparedRawData += "<div class = 'raw-data-row'>"+rawData.replace(/[^\x00-\x7F]/g, "").replace(/\"/g,"")+"</div>"
			// });
			
			localStorage.setItem("spacy-annotation-raw-data",data.text);
		
			$("#completion-percent").attr("value",(Number(data.percent_done)));
			// $("#raw-data-div").html(localStorage.getItem("spacy-annotation-raw-data"));
			// $("#annotation-text").html($(".raw-data-row:first-child").html());
			// $("#annotation-text").html(localStorage.getItem("spacy-annotation-raw-data"));
			$("#annotation-text").html(data.text);
			localStorage.setItem("spacy-annotation-completed-data","");
			$("#completed-data-div").html("");
			// RefreshData();
		})
		.catch(errorMsg => {console.log(errorMsg);})
		

	});
	$("#clear-raw").on("click",function(){
		localStorage.setItem("spacy-annotation-raw-data","");
		RefreshData();
	});
	$("#clear-completed").on("click",function(){
		localStorage.setItem("spacy-annotation-completed-data","");
		RefreshData();
	});
	$("#clear-entity-button").on("click",function(){
		localStorage.setItem("spacy-annotation-entity-names","");
		RefreshData();
	});
	$("#annotation-text").keypress(function(e) {
	
		e.preventDefault();
	});

});