// Code written by Jiefei Wang on 12/15/2022
var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
};
function getCourseFullNameId(courseName) {
    return courseName.replace(/\s+/g, '');
}

function addCourse(data) {
    var couseNum = data["Course Number"];
    if (couseNum == undefined) {
        couseNum = "";
    }
    var courseName = data["Course Name"];
    var fullName = getCourseFullNameId(couseNum + courseName);

    var temp = document.getElementById("course-information-template");
    var clon = temp.content.cloneNode(true);
    var listItem = clon.firstElementChild;
    listItem.dataset.courseName = courseName;
    listItem.dataset.courseNumber = couseNum;
    listItem.dataset.courseFullName = fullName;

    var title = clon.getElementById("course-button");
    title.setAttribute("onclick", `expandOrHide("${fullName}")`);

    var title = clon.getElementById("course-name");
    title.setAttribute("id", fullName);
    title.innerHTML = courseName;
    var panel = clon.getElementById("course-description-panel");
    var prerequisite = [];

    Object.keys(data).forEach(function (key) {
        if (key == "Course Name") {
            return;
        }
        if (key == "Description") {
            var keyElt = document.createElement("b");
            keyElt.innerHTML = key + ":";
            var content = document.createElement("p");
            content.innerText = data[key];

            panel.appendChild(keyElt);
            panel.appendChild(content);
            return;
        }

        if (key.startsWith("Prerequisite")) {
            prerequisite.push(data[key]);
            return;
        }
        var content = document.createElement("p");
        var keyElt = document.createElement("b");
        keyElt.innerHTML = key;
        content.appendChild(keyElt);
        content.append(`: ${data[key]}`);
        panel.appendChild(content);
    });


    if (prerequisite.length != 0) {
        var content = document.createElement("p");
        var keyElt = document.createElement("b");
        keyElt.innerHTML = "Prerequisite";
        content.appendChild(keyElt);
        content.append(`: `);
        for (var i = 0; i < prerequisite.length; i++) {
            var prerequisite_value = prerequisite[i];
            var myArray = prerequisite_value.split(" or ");
            for (var j = 0; j < myArray.length; j++) {
                var courseElt = document.createElement("a");
                getCourseFullNameId
                courseElt.setAttribute("href", "#");
                courseElt.setAttribute("onclick", `gotoCourse("${myArray[j]}")`);
                courseElt.innerText = myArray[j];
                content.appendChild(courseElt);
                if (j != myArray.length - 1) {
                    content.append(` or `);
                }
            }
            if (i != prerequisite.length - 1) {
                content.append(`, `);
            }
        }
        panel.appendChild(content);
    }
    document.getElementById("course-information-panel").appendChild(clon);
};

getJSON('http://raw.githubusercontent.com/Jiefei-Wang/utmb-biostatistics-courses/main/course-list.json',
    function (err, data) {
        if (err != null) {
            console.error(err);
        } else {
            for (var i = 0; i < data.length; i++) {
                addCourse(data[i]);
            }
            collapseAllCourses();
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            if (urlParams.has("course")) {
                var course = urlParams.get("course");
                gotoCourse(course);
            }
            console.log("JW: Department web read successfully");
        }
    });

function scrollToCourse(course) {
    var element = findCoursePanel(course);
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - window.innerHeight / 4;
    window.focus();
    window.scrollTo(0, middle);
}

function findCoursePanel(course) {
    var elt = document.querySelector(`[data-course-full-name="${getCourseFullNameId(course)}"]`);
    if (elt == null) {
        elt = document.querySelector(`[data-course-number="${course}"]`);
    }
    if (elt == null) {
        var elt = document.querySelector(`[data-course-name="${course}"]`);
    }
    return elt;
}

function isHidden(course) {
    var elt = findCoursePanel(course);
    return elt.querySelector("#course-description-panel").hidden;
}

function expandOrHide(course) {
    var elt = findCoursePanel(course);
    if (isHidden(course)) {
        gotoCourse(course);
    } else {
        collapseAllCourses();
    }
}

function gotoCourse(course) {
    var elt = findCoursePanel(course);
    if (elt != null) {
        collapseAllCourses();
        expandCourse(course);
        setTimeout(function () {
            scrollToCourse(course);
        }, 0.2);
    }
}

function collapseAllCourses() {
    var panel = document.getElementById("course-information-panel");
    var items = panel.getElementsByTagName("li");
    for (var i = 0; i < items.length; ++i) {
        collapseCourse(items[i].dataset.courseFullName);
    }
}
function collapseCourse(course) {
    var elt = findCoursePanel(course);
    if (elt != null) {
        elt.querySelector("#course-description-panel").hidden = true;;
    }
}

function expandCourse(course) {
    var elt = findCoursePanel(course);
    if (elt != null) {
        elt.querySelector("#course-description-panel").hidden = false;
    }
}