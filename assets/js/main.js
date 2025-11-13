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
      
      // Get the image container (frame-wrapper__img) which is the actual positioning context
      const imgContainer = frameWrapper.querySelector('.frame-wrapper__img');
      
      // Store original wrapper dimensions BEFORE removing padding
      // This ensures we maintain the exact same visual layout
      const originalWrapperWidth = frameWrapper.offsetWidth;
      const originalWrapperHeight = frameWrapper.offsetHeight;
      const computedPadding = window.getComputedStyle(frameWrapper).padding;
      const paddingValue = parseInt(computedPadding) || 15; // Default 15px if can't parse
      
      // Calculate the image container's actual content dimensions (without padding)
      const imgContainerContentWidth = originalWrapperWidth - (paddingValue * 2);
      const imgContainerContentHeight = imgContainerContentWidth * 0.5625; // 16:9 aspect ratio
      
      // Store original styles
      const originalBg = frameWrapper.style.background;
      const originalPaddingStyle = frameWrapper.style.padding;
      const originalBorderRadius = frameWrapper.style.borderRadius;
      const originalBoxShadow = frameWrapper.style.boxShadow;
      const originalBorder = frameWrapper.style.border;
      const originalOverflow = frameWrapper.style.overflow;
      const originalImgPosition = imgContainer ? imgContainer.style.position : '';
      const originalImgWidth = imgContainer ? imgContainer.style.width : '';
      const originalImgHeight = imgContainer ? imgContainer.style.height : '';
      const originalImgPaddingTop = imgContainer ? imgContainer.style.paddingTop : '';
      
      // Remove white border styling temporarily from wrapper
      frameWrapper.style.background = "transparent";
      frameWrapper.style.padding = "0";
      frameWrapper.style.borderRadius = "0";
      frameWrapper.style.boxShadow = "none";
      frameWrapper.style.border = "none";
      frameWrapper.style.overflow = "hidden";
      
      // CRITICAL: Set explicit dimensions on wrapper to match the image container content area
      // This ensures the positioning context doesn't change
      frameWrapper.style.width = imgContainerContentWidth + "px";
      frameWrapper.style.height = imgContainerContentHeight + "px";
      
      // Ensure imgContainer maintains its aspect ratio and positioning
      if (imgContainer) {
        imgContainer.style.position = "relative";
        imgContainer.style.width = "100%";
        imgContainer.style.height = "100%";
        imgContainer.style.paddingTop = "0"; // Remove padding-top since we're using explicit height
      }
      
      // Adjust name position for export to account for any offset
      // The name needs to be moved down slightly in the exported image
      const nameElement = document.querySelector('.name');
      if (nameElement) {
        // Move down by ~1.2% to align with Đ/c: in exported image
        // This compensates for the difference between preview and export positioning
        nameElement.style.top = "60.46%"; // 59.26% + 1.2% = 60.46%
      }
      
      // Ensure all text elements are visible and properly styled
      $(".name-content, .title-content, .message-content").css({
        "visibility": "visible",
        "opacity": "1"
      });
      
      // Small delay to ensure rendering
      setTimeout(function() {
        // After removing padding, calculate the actual content dimensions
        const contentWidth = frameWrapper.offsetWidth;
        const contentHeight = frameWrapper.offsetHeight;
        
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
        
        // Capture the wrapper - padding has been removed so no border will appear
        const captureTarget = frameWrapper;
        
        domtoimage
          .toPng(captureTarget, options)
          .then(function (dataUrl) {
            // Double render for better quality
            domtoimage.toPng(captureTarget, options).then(function (data1) {
              // Restore original styles
              frameWrapper.style.background = originalBg;
              frameWrapper.style.padding = originalPaddingStyle;
              frameWrapper.style.borderRadius = originalBorderRadius;
              frameWrapper.style.boxShadow = originalBoxShadow;
              frameWrapper.style.border = originalBorder;
              frameWrapper.style.overflow = originalOverflow;
              frameWrapper.style.width = ""; // Reset to auto
              frameWrapper.style.height = ""; // Reset to auto
              
              // Restore imgContainer styles
              if (imgContainer) {
                imgContainer.style.position = originalImgPosition;
                imgContainer.style.width = originalImgWidth;
                imgContainer.style.height = originalImgHeight;
                imgContainer.style.paddingTop = originalImgPaddingTop;
              }
              
              // Restore name position
              const nameElement = document.querySelector('.name');
              if (nameElement) {
                nameElement.style.top = ""; // Reset to CSS default
              }
              
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
            frameWrapper.style.padding = originalPaddingStyle;
            frameWrapper.style.borderRadius = originalBorderRadius;
            frameWrapper.style.boxShadow = originalBoxShadow;
            frameWrapper.style.border = originalBorder;
            frameWrapper.style.overflow = originalOverflow;
            frameWrapper.style.width = ""; // Reset to auto
            frameWrapper.style.height = ""; // Reset to auto
            
            // Restore imgContainer styles
            if (imgContainer) {
              imgContainer.style.position = originalImgPosition;
              imgContainer.style.width = originalImgWidth;
              imgContainer.style.height = originalImgHeight;
              imgContainer.style.paddingTop = originalImgPaddingTop;
            }
            
            // Restore name position
            const nameElement = document.querySelector('.name');
            if (nameElement) {
              nameElement.style.top = ""; // Reset to CSS default
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

