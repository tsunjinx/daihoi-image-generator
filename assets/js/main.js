const TEMPLATE_WIDTH = 1920;
const TEMPLATE_HEIGHT = 1080;
function debounce(fn, delay) {
  let timer;
  return function () {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
    }, delay);
  };
}

function scaleFrameCanvas() {
  const wrapper = document.querySelector(".frame-wrapper__img");
  if (!wrapper) {
    return;
  }
  const canvas = wrapper.querySelector(".frame-canvas");
  if (!canvas) {
    return;
  }
  const wrapperWidth = wrapper.offsetWidth;
  if (!wrapperWidth) {
    return;
  }
  const scale = wrapperWidth / TEMPLATE_WIDTH;
  canvas.style.transform = "scale(" + scale + ")";
  wrapper.style.height = TEMPLATE_HEIGHT * scale + "px";
}

const scaleFrameCanvasDebounced = debounce(scaleFrameCanvas, 100);

$(document).ready(function () {
  let cropper;
  const $imageChoose = $("#image-choose");
  const $imgChoosen = $("#img-choosen");
  const $cropperImage = $("#cropperImage");
  const $cropperModal = $("#cropperModal");
  const $saveCroppedImage = $("#saveCroppedImage");
  const $closeModal = $(".close");
  
  function resetInput() {
    $imageChoose.val("");
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }
  
  $imageChoose.on("change", function () {
    const files = this.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        $cropperImage.attr("src", event.target.result);
        $cropperModal.show();
        if (cropper) {
          cropper.destroy();
        }
        cropper = new Cropper($cropperImage[0], {
          aspectRatio: 1,
          viewMode: 1,
        });
      };
      reader.readAsDataURL(file);
    }
  });
  
  $saveCroppedImage.on("click", function () {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const base64encodedImage = canvas.toDataURL("image/jpeg");
      $imgChoosen.attr("src", base64encodedImage);
      $cropperModal.hide();
      resetInput();
    }
  });
  
  $closeModal.on("click", function () {
    $cropperModal.hide();
    resetInput();
  });
  
  $(window).on("click", function (event) {
    if (event.target == $cropperModal[0]) {
      $cropperModal.hide();
      resetInput();
    }
  });
  
  $("#name").on("input", function () {
    const nameValue = $(this).val();
    if (nameValue) {
      $(".name-content").html("<span style='color: #ffff00;'></span>" + nameValue);
    } else {
      $(".name-content").text("");
    }
  });
  
  $("#title").on("input", function () {
    $(".title-content").text($(this).val());
  });
  
  $("#message").on("input", function () {
    $(".message-content").text($(this).val());
  });

  scaleFrameCanvas();
  $(window).on("resize", scaleFrameCanvasDebounced);
  
  function waitForExportFonts() {
    if (!document.fonts) {
      return Promise.resolve();
    }
    return Promise.all([
      document.fonts.ready,
      document.fonts.load('400 14px "Roboto"'),
      document.fonts.load('700 14px "Roboto"'),
      document.fonts.load('italic 16px "Roboto"'),
    ]);
  }

function cloneCanvasForExport(canvas) {
  const hiddenHost = document.createElement("div");
  hiddenHost.style.position = "fixed";
  hiddenHost.style.top = "-10000px";
  hiddenHost.style.left = "-10000px";
  hiddenHost.style.width = TEMPLATE_WIDTH + "px";
  hiddenHost.style.height = TEMPLATE_HEIGHT + "px";
  hiddenHost.style.pointerEvents = "none";
  hiddenHost.style.opacity = "0";
  hiddenHost.style.zIndex = "-1";

  const clone = canvas.cloneNode(true);
  clone.style.transform = "none";
  clone.style.width = TEMPLATE_WIDTH + "px";
  clone.style.height = TEMPLATE_HEIGHT + "px";
  clone.style.margin = "0";
  clone.style.position = "relative";
  clone.style.background = "transparent";
  clone.style.border = "none";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.overflow = "hidden";

  hiddenHost.appendChild(clone);
  document.body.appendChild(hiddenHost);

  return {
    node: clone,
    cleanup: function () {
      if (hiddenHost && hiddenHost.parentNode) {
        hiddenHost.parentNode.removeChild(hiddenHost);
      }
    },
  };
}

  function triggerDownload(dataUrl, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function ensureTemplateReady(templateImg, fallbackWidth, fallbackHeight) {
    return new Promise(function (resolve, reject) {
      if (!templateImg) {
        resolve({
          width: fallbackWidth,
          height: fallbackHeight,
        });
        return;
      }

      function finalize() {
        const naturalWidth = templateImg.naturalWidth || fallbackWidth;
        const naturalHeight = templateImg.naturalHeight || fallbackHeight;
        resolve({ width: naturalWidth, height: naturalHeight });
      }

      if (templateImg.complete && templateImg.naturalWidth) {
        finalize();
      } else {
        templateImg.addEventListener(
          "load",
          function () {
            finalize();
          },
          { once: true }
        );
        templateImg.addEventListener(
          "error",
          function () {
            reject(new Error("Không thể tải template."));
          },
          { once: true }
        );
      }
    });
  }

  function buildExportImage() {
    return new Promise(function (resolve, reject) {
      const frameWrapper = document.getElementById("frame-wrapper");
      if (!frameWrapper) {
        reject(new Error("Không tìm thấy khung ảnh."));
        return;
      }

      const canvas = frameWrapper.querySelector(".frame-canvas");
      if (!canvas) {
        reject(new Error("Không tìm thấy nội dung cần xuất."));
        return;
      }

      const templateImg = canvas.querySelector("img.template-image");
      const DEFAULT_WIDTH = TEMPLATE_WIDTH;
      const DEFAULT_HEIGHT = TEMPLATE_HEIGHT;

      ensureTemplateReady(templateImg, DEFAULT_WIDTH, DEFAULT_HEIGHT)
        .then(function (dimensions) {
          const { width: naturalWidth, height: naturalHeight } = dimensions;
        const { node, cleanup } = cloneCanvasForExport(canvas);

        domtoimage
          .toPng(node, {
            width: naturalWidth,
            height: naturalHeight,
            quality: 1,
            useCORS: true,
            cacheBust: true,
            bgcolor: "transparent",
            filter: function (node) {
              const tagName = node.tagName ? node.tagName.toLowerCase() : "";
              return tagName !== "script" && tagName !== "style";
            },
          })
          .then(function (dataUrl) {
            cleanup();
            resolve(dataUrl);
          })
          .catch(function (error) {
            cleanup();
            reject(error);
          });
        })
        .catch(reject);
    });
  }

  function handleExportError(error) {
    console.error("Error generating image:", error);
    alert("Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.");
  }

  $("#submit").click(function () {
    $(".loader-wrapper").show();

    waitForExportFonts()
      .catch(function (error) {
        console.warn("Font loading warning:", error);
      })
      .then(buildExportImage)
      .then(function (dataUrl) {
        triggerDownload(dataUrl, "kyvongdaihoi.png");
      })
      .catch(handleExportError)
      .finally(function () {
        $(".loader-wrapper").hide();
      });
  });
});

