var timeoutID;
function toggleSearch() {
    var searchInput = document.getElementById("searchInput");
    var searchForm = document.querySelector("form");
    if (searchInput.style.display === "none") {
        searchInput.style.display = "block";
    }
    if (searchInput.value !== "") {
        searchForm.submit();
    }
    else {
        timeoutID = setTimeout(function() {
            searchInput.style.display = "none";
        }, 5000);
    }
}

function cancelTimeout() {
    clearTimeout(timeoutID);
}

var searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function() {
    if (searchInput.value !== "") {
        cancelTimeout();
    } else {
        toggleSearch();
    }
});

function calculateTotal() {
    let total = 0;
    let discount = 0;
    const items = $("[data-price]");
    const itemCount = $("#itemCount");
    if (items.length > 0) {
        itemCount.html(items.length);
    }
    else itemCount.hide();
    
    items.each(function() {
        total += Number($(this).data("price"));
        discount += Number($(this).data("discount") || 0);
    });
    const subtotal = total - discount;
    const discountElement = $("#discountBlock");
    if (discount > 0) {
        $("#discount").html(discount.toLocaleString());
    }
    else discountElement.hide();
    $("#total").html(total.toLocaleString());
    $("#subtotal").html(subtotal.toLocaleString());
}
$(document).ready(calculateTotal);

function handleRemoveClick(event) {
  let itemElement = $(event.target).closest(".item");
  itemElement.remove();
  updateCart();
}
function updateCart() {
    calculateTotal();
}
$(".item .remove-link").on("click", handleRemoveClick);

$('#gamesCarousel').on('slid.bs.carousel', function () {
    var index = $(this).find('.carousel-item.active').index();
    if (window.matchMedia('(max-width: 767px)').matches) {
        $('#carousel-buttons button').removeClass('active');
        $('#carousel-buttons button').eq(index).addClass('active');
    }
    else {
        $('#carousel-buttons div[type="button"]').removeClass('active');
        $('#carousel-buttons div[type="button"]').eq(index).addClass('active');
    }
});
