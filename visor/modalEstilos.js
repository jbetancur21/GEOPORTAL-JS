$(document).on("click","#modal",function(){
    var estilo =$(this).data('estilo');
    var id_capa =$(this).data('id_capa');
    var nombre_capa =$(this).data('nombre_capa');
    var tipo_capa =$(this).data('tipo_capa');
    var id =$(this).data('id');
    var borde =$(this).data('borde');

    $("#estilo").val(estilo);
    $("#id_capa").val(id_capa);
    $("#nombre_capa").val(nombre_capa);
    $("#tipo_capa").val(tipo_capa);
    $("#id").val(id);
    $("#borde").val(borde);
})