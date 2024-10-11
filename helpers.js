// Main function to create and update signatures info
export function createSignaturesInfoNode(instance, signaturesInfoSidebar) {
  const container = document.createElement("div");
  container.className = "signaturesInfo";
  container.style.padding = "15px";
  container.innerHTML = signaturesInfoSidebar;

  function updateSignaturesInfo() {
    setTimeout(async () => {
      const signaturesInfo = await instance.getSignaturesInfo();
      updateCommonInfo(container, signaturesInfo);
      updateSignaturesList(container, signaturesInfo.signatures);
    }, 0);
  }

  // Add event listeners
  [
    "document.change",
    "annotations.change",
    "formFields.change",
    "bookmarks.change",
  ].forEach((event) => {
    instance.addEventListener(event, updateSignaturesInfo);
  });

  updateSignaturesInfo();
  return container;
}

export const signaturesInfoSrc = `
  <div class="signaturesInfo__header">
    <h2>Signatures Info</h2>
  </div>
  <div class="signaturesInfo__body">
    <header class="signaturesInfo__common"></header>
    <div class="signaturesInfo__list"></div>
  </div>
  `;

const readableSignatureInfoMap = {
  status: "Status",
  not_signed: "Not Signed",
  checkedAt: "Checked At",
  signerName: "Signer Name",
  signerLocation: "Signer Location",
  signerReason: "Signer Reason",
  creationDate: "Creation Date",
  documentIntegrityStatus: "Document Integrity Status",
  certificateChainValidationStatus: "Certificate Chain Validation Status",
  signatureValidationStatus: "Signature Validation Status",
  isTrusted: "Is Trusted",
  isSelfSigned: "Is Self Signed",
  isExpired: "Is Expired",
  documentModifiedSinceSignature: "Document Modified Since Signature",
  ok: "OK",
  tampered_document: "Tampered Document",
  failed_to_retrieve_signature_contents:
    "Failed to Retrieve Signature Contents",
  failed_to_retrieve_byterange: "Failed to Retrieve Byterange",
  failed_to_compute_digest: "Failed to Compute Digest",
  failed_retrieve_signing_certificate: "Failed Retrieve Signing Certificate",
  failed_retrieve_public_key: "Failed Retrieve Public Key",
  failed_encryption_padding: "Failed Encryption Padding",
  general_failure: "General Failure",
  ok_but_self_signed: "OK But Self Signed",
  untrusted: "Untrusted",
  expired: "Expired",
  not_yet_valid: "Not Yet Valid",
  invalid: "Invalid",
  revoked: "Revoked",
  general_validation_problem: "General Validation Problem",
  valid: "Valid",
  warning: "Warning",
  error: "Error",
};

// Helper function to get readable key and value
function getReadableSignatureInfo(key, value) {
  return {
    readableKey: readableSignatureInfoMap[key] || key,
    readableValue: readableSignatureInfoMap[value] || value,
  };
}

// Helper function to add an entry to the container
function addEntry(container, key, value) {
  const { readableKey, readableValue } = getReadableSignatureInfo(key, value);
  container.innerHTML += `<strong>${readableKey}</strong>: ${readableValue}<br>`;
}

function updateCommonInfo(container, signaturesInfo) {
  const header = container.querySelector(".signaturesInfo__common");
  header.innerHTML = "";
  Object.entries(signaturesInfo).forEach(([key, value]) => {
    if (typeof value !== "undefined" && key !== "signatures") {
      addEntry(header, key, value);
    }
  });
}

function updateSignaturesList(container, signatures) {
  const signatureInfoList = container.querySelector(".signaturesInfo__list");
  signatureInfoList.innerHTML = "";
  signatures.forEach((signature, index) => {
    const signatureInfo = createSignatureInfoElement(signature, index);
    signatureInfoList.appendChild(signatureInfo);
  });
}

function createSignatureInfoElement(signature, index) {
  const signatureInfo = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `Signature ${index + 1}`;
  summary.className = getSignatureStatusClass(
    signature.signatureValidationStatus
  );
  signatureInfo.appendChild(summary);

  Object.entries(signature).forEach(([key, value]) => {
    if (typeof value !== "undefined" && key !== "type") {
      addEntry(signatureInfo, key, value);
    }
  });

  return signatureInfo;
}

function getSignatureStatusClass(status) {
  const statusMap = {
    [PSPDFKit.SignatureValidationStatus.valid]:
      "signaturesInfo__summary--valid",
    [PSPDFKit.SignatureValidationStatus.warning]:
      "signaturesInfo__summary--warning",
    [PSPDFKit.SignatureValidationStatus.error]:
      "signaturesInfo__summary--error",
  };
  return statusMap[status] || "";
}