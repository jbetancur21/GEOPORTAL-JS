$(document).on("click","#modal",function(){
    var id =$(this).data('id');
    var frm =$(this).data('frm');

    $("#id").val(id);
    $("#frm").val(frm);
})