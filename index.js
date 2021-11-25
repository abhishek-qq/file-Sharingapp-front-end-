const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browsebtn = document.querySelector(".browsebtn");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");
const sharingContainer = document.querySelector(".sharing-container");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");

const maxAllowedSize = 100*1024*1024;


const bgProgress = document.querySelector(".bg-progress");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent")

const host = "https://innshare.herokuapp.com/";
const uploadUrl = `${host}api/files`
const emailUrl = `${host}api/files/send`


dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }

});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragged");
    console.log(e.dataTransfer.files);
    const files = e.dataTransfer.files;
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change", () => {
    uploadFile();
})

browsebtn.addEventListener("click", (e) => {
    fileInput.click();
})



copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link Copied");

})



const uploadFile = () => {
   
    if(fileInput.files.length > 1){
        showToast("Please Upload Only One file");
        fileInput.value="";
        return
    }

    const file = fileInput.files[0];
    if(file.size > maxAllowedSize){
        showToast("can not upload file of more than 100mb");
        resetFileInput();
        return
    }

    progressContainer.style.display = "block";
    
    const formData = new FormData();
    formData.append("myfile", file);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response)
            onUploadSucess(JSON.parse(xhr.response))
        }
    };
    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror =()=>{
        resetFileInput();
        showToast(`Error in upload: ${xhr.statusText}`);
    }


    xhr.open("POST", uploadUrl);
    xhr.send(formData)

}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100)
    // console.log(percent);
    bgProgress.style.width = `${percent}%`
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`

}

const onUploadSucess = ({ file: url }) => {
    console.log(url);
    emailForm[2].removeAttribute("disabled");
    fileInput.value="";
    progressContainer.style.display = "none";
    fileURLInput.value = url;
    sharingContainer.style.display = "block";


}
const resetFileInput =()=>{
    fileInput.value ="";

}

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("submit form");
    const url = fileURLInput.value;
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    };
    emailForm[2].setAttribute("disabled", "true");
    console.log(formData);
    fetch(emailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showToast("Email Sent");
            sharingContainer.style.display = "none"; // hide the box
          }

        });
});

let toastTimer;

const showToast = (mesg)=>{

    toast.innerText = mesg;
    toast.style.transform ="translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform ="translateY(-50%, 60px)";
    }, 2000);

    
};












