const PSPDFKit = window.PSPDFKit;
import {createSignaturesInfoNode, signaturesInfoSrc} from './helpers.js';

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
// const baseUrl = "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.6.0/";
const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;
// Bringing Basline UI
const {
  UI: { createBlock, Recipes, Interfaces, Core },
} = PSPDFKit;

//Translations in Hindi
const hindiTranslations = {
  "loading": "दस्तावेज़ लोड हो रहा है...",
  "zoomIn": "बड़ा करें",
  "zoomOut": "छोटा करें",
  "download": "डाउनलोड",
  "print": "प्रिंट करें",
  "thumbnails": "थंबनेल",
  "outline": "आउटलाइन",
  "searchDocument": "खोजें",
  "annotations": "टिप्पणियाँ"
};

async function initializePSPDFKit(pdfArrayBuffer) {
  document.getElementById('drop-area').style.display = 'none';
  document.querySelector('.container').style.display = 'flex';
  try {
    // Step 1 of 2 of translation
    PSPDFKit.I18n.locales.push('hi');
    PSPDFKit.I18n.messages.hi = hindiTranslations
    
    const instance = await PSPDFKit.load({
      baseUrl,
      container: "#pspdfkit",
      document: pdfArrayBuffer,
      toolbarItems: [...PSPDFKit.defaultToolbarItems, { type: "comment" }],
      
      // Step 2 of 2 of translation
      locale: "hi",

      // Customizing the Sidebar UI for displaying more signature related information
      customUI:{
        [PSPDFKit.UIElement.Sidebar]: {
           [PSPDFKit.SidebarMode.SIGNATURES]({ containerNode }) {
              // Getting signature info
              if (
                window.instance &&
                containerNode &&
                !containerNode.querySelector(".signaturesInfo")
              ) {
                containerNode.append(
                  createSignaturesInfoNode(instance, signaturesInfoSrc)
                );
              }
            }
        }
      },

      // Set the width of comment-thread to remove the horizontal scrollbar
      ui: {
        [Interfaces.CommentThread]: ({ props: props }) => ({
          content: createBlock(Recipes.CommentThread, props, ({ ui: ui }) => {
            const comment = ui.getBlockById("comment-thread");
            comment._props.style.width = 'min-content';
            return ui.createComponent();
          }).createComponent(),
        }),
      },
    });
    window.instance = instance;
    // Set the initial view state to fit the width of the page
    instance.setViewState(viewState => (
      viewState.set("zoom", "FIT_TO_WIDTH")
    ));
    console.log("PSPDFKit loaded", window.instance);
    
  } catch (error) {
    console.error("Error loading PSPDFKit:", error.message);
  }
}

function uploadDoc() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const uploadButton = document.getElementById('upload-button');
  const status = document.getElementById('status');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropArea.classList.add('highlight');
  }

  function unhighlight() {
    dropArea.classList.remove('highlight');
  }

  dropArea.addEventListener('drop', handleDrop, false);
  fileInput.addEventListener('change', handleFiles, false);
  uploadButton.addEventListener('click', () => fileInput.click());

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleFiles(files) {
    if (files instanceof FileList) {
      ([...files]).forEach(uploadFile);
    } else if (files.target && files.target.files) {
      ([...files.target.files]).forEach(uploadFile);
    }
  }

  function uploadFile(file) {
    if (file.type !== "application/pdf") {
      status.textContent = "Please upload a valid PDF file.";
      return;
    }

    status.textContent = "Uploading...";
    
    const reader = new FileReader();
    reader.onload = function(e) {
      status.textContent = "Upload successful. Initializing PDF viewer...";

      initializePSPDFKit(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }
}

// Call the uploadDoc function when the page loads
document.addEventListener('DOMContentLoaded', uploadDoc);