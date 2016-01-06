var disableInput = function(el) {
    var targetName = $(el).data('target');
    var targetVal = $("input[name='" + targetName + "']");
    var targetDate = $("input[name='lastUpdate" + targetName + "']");
    targetVal.attr('disabled',el.checked);
    targetDate.attr('disabled',el.checked);
    if (el.checked) {
        targetVal.data('oldVal',targetVal.val());
        targetDate.data('oldVal',targetDate.val());
        targetVal.val('');
        targetDate.val('');
    } else {
        targetVal.val(targetVal.data('oldVal'));
        targetDate.val(targetDate.data('oldVal'));
        targetVal.data('oldVal','');
        targetDate.data('oldVal','');
    }
}

$(document).ready(function(){

  $("input.decimal").keydown(function(event) {

    if (event.shiftKey == true)
      event.preventDefault();

    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105) ||
      event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 ||
      event.keyCode == 39 || event.keyCode == 46 || event.keyCode == 190) {

    } else {
      event.preventDefault();
    }

    if($(this).val().indexOf('.') !== -1 && event.keyCode == 190)
      event.preventDefault();

    //if a decimal has been added, disable the "."-button
  });
});


