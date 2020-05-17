

const projectOptions = Array.from(document.querySelectorAll("#ctl00_ContentPlaceHolder_idProyectoDropDownList option"))
const assignmentOptions = Array.from(document.querySelectorAll("#ctl00_ContentPlaceHolder_idTipoAsignacionDropDownList option"))
const focalPointOptions = Array.from(document.querySelectorAll("#ctl00_ContentPlaceHolder_idFocalPointClientDropDownList option"))
const dateInput = document.getElementById("ctl00_ContentPlaceHolder_txtFrom")
//ctl00_ContentPlaceHolder_idFocalPointClientDropDownList
const projects = projectOptions.map(o => {
    return {text:o.text,value:o.value}
})
const assignments = assignmentOptions.map(o => {
    return {text:o.text,value:o.value}
})
const focalPoints = focalPointOptions.map(o => {
    return {text:o.text,value:o.value}
})
const message = {
    dateValue: dateInput.value,
    projects: projects,
    assignments: assignments,
    focalPoints: focalPoints
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.command)
        if(request.command == "load-info"){
            sendResponse(message);
        }
        if(request.command == "fill-info"){ 
            window.onbeforeunload  = function(event){
                sendResponse("fill-end");
            };
            document.getElementById("ctl00_ContentPlaceHolder_txtFrom").value = request.entry.date;
            document.getElementById("ctl00_ContentPlaceHolder_TiempoTextBox").value = request.entry.hours;
            document.getElementById("ctl00_ContentPlaceHolder_DescripcionTextBox").value = request.entry.description;
            document.getElementById("ctl00_ContentPlaceHolder_btnAceptar").click();
        }   
        if(request.command == "redirect"){
            window.location = "https://timetracker.bairesdev.com/CargaTimeTracker.aspx"
        } 
});


//document.getElementById("ctl00_ContentPlaceHolder_TiempoTextBox").value = "1";
//document.getElementById("ctl00_ContentPlaceHolder_DescripcionTextBox").value = 'request.entry.hours;as asd as asdasjçlasjkçalksjçasld'
//document.getElementById("ctl00_ContentPlaceHolder_btnAceptar").click();