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
  
  $("#submit").click(function () {
    $(".loader-wrapper").show();
    
    // Wait for fonts to be loaded, especially Roboto
    Promise.all([
      document.fonts.ready,
      document.fonts.load('400 12px "Roboto"'),
      document.fonts.load('bold 12px "Roboto"'),
      document.fonts.load('italic 14px "Roboto"')
    ]).then(function() {
      var frameWrapper = document.getElementById("frame-wrapper");
      const scaleObject = window.innerWidth < 768 ? 10 : 5;
      
      // Get the image container and the actual template image
      const imgContainer = frameWrapper.querySelector('.frame-wrapper__img');
      const templateImg = imgContainer ? imgContainer.querySelector('img.template-image') : null;
      
      // CRITICAL: Use the template image's natural dimensions to maintain aspect ratio
      // Template is 5760x3240 (16:9), so we need to maintain this exact ratio
      // Get the displayed width of the image container (while padding is still there)
      const imgContainerWidth = imgContainer ? imgContainer.offsetWidth : frameWrapper.offsetWidth;
      
      // Calculate height based on template's aspect ratio (5760:3240 = 16:9 = 56.25%)
      // This ensures percentage positioning works the same in preview and export
      const imgContainerHeight = imgContainerWidth * (3240 / 5760); // Exact template ratio
      
      // Store original styles
      const originalBg = frameWrapper.style.background;
      const originalPadding = frameWrapper.style.padding;
      const originalBorderRadius = frameWrapper.style.borderRadius;
      const originalBoxShadow = frameWrapper.style.boxShadow;
      const originalBorder = frameWrapper.style.border;
      const originalOverflow = frameWrapper.style.overflow;
      
      // Remove white border styling temporarily
      frameWrapper.style.background = "transparent";
      frameWrapper.style.padding = "0";
      frameWrapper.style.borderRadius = "0";
      frameWrapper.style.boxShadow = "none";
      frameWrapper.style.border = "none";
      frameWrapper.style.overflow = "hidden";
      
      // Ensure all text elements are visible and properly styled
      $(".name-content, .title-content, .message-content").css({
        "visibility": "visible",
        "opacity": "1"
      });
      
      // Small delay to ensure rendering
      setTimeout(function() {
        // Use the dimensions we calculated BEFORE removing padding
        // These maintain the exact template aspect ratio (5760:3240)
        // This ensures percentage positioning is consistent between preview and export
        const contentWidth = imgContainerWidth;
        const contentHeight = imgContainerHeight;
        
        // Ensure we have valid dimensions
        if (contentWidth <= 0 || contentHeight <= 0) {
          console.error("Invalid dimensions:", contentWidth, contentHeight);
          alert("Không thể lấy kích thước ảnh. Vui lòng thử lại.");
          // Restore styles
          frameWrapper.style.background = originalBg;
          frameWrapper.style.padding = originalPadding;
          frameWrapper.style.borderRadius = originalBorderRadius;
          frameWrapper.style.boxShadow = originalBoxShadow;
          frameWrapper.style.border = originalBorder;
          frameWrapper.style.overflow = originalOverflow;
          $(".loader-wrapper").hide();
          return;
        }
        
        var options = {
          width: contentWidth * scaleObject,
          height: contentHeight * scaleObject,
          style: {
            transform: "scale(" + scaleObject + ")",
            transformOrigin: "top left",
          },
          quality: 1,
          useCORS: true,
          cacheBust: true,
          bgcolor: "transparent",
          filter: function(node) {
            // Ensure all text nodes are included
            return (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE');
          }
        };
        
        // Capture the wrapper (padding already removed, so no border)
        const captureTarget = frameWrapper;
        
        domtoimage
          .toPng(captureTarget, options)
          .then(function (dataUrl) {
            // Double render for better quality
            domtoimage.toPng(captureTarget, options).then(function (data1) {
              // Restore original styles
              frameWrapper.style.background = originalBg;
              frameWrapper.style.padding = originalPadding;
              frameWrapper.style.borderRadius = originalBorderRadius;
              frameWrapper.style.boxShadow = originalBoxShadow;
              frameWrapper.style.border = originalBorder;
              frameWrapper.style.overflow = originalOverflow;
              
              var link = document.createElement("a");
              link.download = "Guiloiyeuthuong.png";
              link.href = data1;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              $(".loader-wrapper").hide();
            });
          })
          .catch(function (error) {
            // Restore original styles on error
            frameWrapper.style.background = originalBg;
            frameWrapper.style.padding = originalPadding;
            frameWrapper.style.borderRadius = originalBorderRadius;
            frameWrapper.style.boxShadow = originalBoxShadow;
            frameWrapper.style.border = originalBorder;
            frameWrapper.style.overflow = originalOverflow;
            
            // Restore name position
            if (nameElement) {
              nameElement.style.top = originalNameTop || "";
            }
            
            console.error("Error generating image:", error);
            $(".loader-wrapper").hide();
            alert("Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.");
          });
      }, 200);
    }).catch(function(error) {
      console.error("Font loading error:", error);
      // Continue anyway if font loading fails
      var frameWrapper = document.getElementById("frame-wrapper");
      const scaleObject = window.innerWidth < 768 ? 10 : 5;
      
      // Store and remove styles
      const originalBg = frameWrapper.style.background;
      const originalPadding = frameWrapper.style.padding;
      const originalBorderRadius = frameWrapper.style.borderRadius;
      const originalBoxShadow = frameWrapper.style.boxShadow;
      const originalBorder = frameWrapper.style.border;
      
      frameWrapper.style.background = "transparent";
      frameWrapper.style.padding = "0";
      frameWrapper.style.borderRadius = "0";
      frameWrapper.style.boxShadow = "none";
      frameWrapper.style.border = "none";
      
      var options = {
        width: frameWrapper.offsetWidth * scaleObject,
        height: frameWrapper.offsetHeight * scaleObject,
        style: {
          transform: "scale(" + scaleObject + ")",
          transformOrigin: "top left",
        },
        quality: 1,
        useCORS: true,
        cacheBust: true,
        bgcolor: "transparent",
      };
      domtoimage.toPng(frameWrapper, options).then(function (data1) {
        // Restore styles
        frameWrapper.style.background = originalBg;
        frameWrapper.style.padding = originalPadding;
        frameWrapper.style.borderRadius = originalBorderRadius;
        frameWrapper.style.boxShadow = originalBoxShadow;
        frameWrapper.style.border = originalBorder;
        
        var link = document.createElement("a");
        link.download = "Guiloiyeuthuong.png";
        link.href = data1;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        $(".loader-wrapper").hide();
      });
    });
  });
});

