// $(document).ready(function() {
  
//     /* Small card slider */ 
//     $('.slider').slick({
//       arrows: false,
//       dots: false,
//       infinite: true,
//       initialSlide: 0,
//       slidesToScroll: 1,
//       slidesToShow: 1
//     });
    
    
//     // *****
//     //Habilitar si se quiere con el scroll del mouse

//     // const slider = $(".slider");
//     // var scrollCount = null;
//     // var scroll= null;
  
//     // slider.on('wheel', (function(e) {

//     //   e.preventDefault();
      
//     //   clearTimeout(scroll);
//     //   scroll = setTimeout(function(){scrollCount=0;});
//     //   if(scrollCount) return 0;
//     //   scrollCount=1;
  
//     //   if (e.originalEvent.deltaY < 0) {
//     //     $(this).slick('slickNext');
//     //   } else {
//     //     $(this).slick('slickPrev');
//     //   }
//     // }));

//     // *****


//     $(".slider__item").on("mouseover", function(){$(this).find(".kl-card-body").removeClass("opacity-0")});
//     $(".slider__item").on("mouseleave", function(){$(this).find(".kl-card-body").addClass("opacity-0")})


//   });



$(document).ready(function() {
  $('.slider').slick({
    arrows: false,
    dots: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200, // laptops
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 992, // tablets
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768, // móviles
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });

  // Hover efecto
  $(".slider__item").on("mouseover", function() {
    $(this).find(".kl-card-body").removeClass("opacity-0");
  });
  $(".slider__item").on("mouseleave", function() {
    $(this).find(".kl-card-body").addClass("opacity-0");
  });
});