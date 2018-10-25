var page = 1;
var pageSize=3;


// 获取列表信息
function getList(){
    $.get('/brand/list',{
        page:page,
        pageSize:pageSize
    },function(result){
        console.log(result);

        if (result.code === 0) {
            var list = result.data.list;
            var totalPage = result.data.totalPage;

            var str = '';
            for (var i=0;i<list.length;i++) {
                str += `
                    <tr>
                        <td class='brand_id' style="display:none;">${ list[i]._id }</td>
                        <td>${i+1}</td>
                        <td class='brand-img'>
                            <img src="/brand/${list[i].fileName}"  />
                        </td>
                        <td class='brand-name'>${ list[i].brandName }</td>
                        <td>
                            <a class="updataBrand">修改</a>
                            <a class="deleteBrand">删除</a>
                        </td>
                    </tr>
                `
            }
            var pageStr = '';
            for(var i=0; i<totalPage;i++){
                pageStr +=`
                    <button data-id="${i+1}">第${i+1}页</button>
                `
            }

            $('tbody').html(str);
            $('#pageEl').html(pageStr);

        }

    })
}




$(function(){

   // 默认调用
    getList();

    $("#addBrand").click(function(){
        $("#addInfo").show();
    });

    $("#cancleBrand").click(function(){
        $("#addInfo").hide();
    })


    //新增
     $("#add").click(function(){
       //新增手机
        var formData = new FormData();

        formData.append( 'brandName',$("#addBrandName").val() );
        formData.append( 'brandImg',$("#brand")[0].files[0] );

        $.ajax({
            url: '/brand/add',
            method: 'post',
            data:formData,
            contentType:false,
            processData:false,
            success:function(result){
                if(result.code === 0){
                    $('#addInfo').hide();
                    getList();
                } else {
                    alert('网络异常，请稍后重试');
                }   
            },
            erro:function(err){
                console.log(err);
            }
        })
    })

    $('#pageEl').on('click','button',function(){
        page = $(this).attr('data-id');
        getList();
    })

    //删除
    $('#list-body').on('click','.deleteBrand',function(){
        var brandId = $(this).parent().parent().find(".brand_id").html();
        $.get('/brand/delete',{_id:brandId},function(res){
            if(res.code === 0){
               getList();
            }
        })
    })

    //修改
    $('#list-body').on('click','.updataBrand',function(){
        $('#resetInfo').show();
        var name = $(this).parent().parent().find(".brand-name").html();
        var brandId = $(this).parent().parent().find(".brand_id").html();

        $('#resetBrandName').val(name);
        $('#resetBrandId').val(brandId);
    })



    $("#resetBtn").click(function(){

        var formData = new FormData();
        formData.append( 'brandId',$("#resetBrandId").val() );
        formData.append( 'brandName',$("#resetBrandName").val() );
        formData.append( 'brandImg',$("#resetBrand")[0].files[0] );

        $.ajax({
            url: '/brand/updata',
            method: 'post',
            data:formData,
            contentType:false,
            processData:false,
            success:function(result){
                if(result.code === 0){
                    $('#resetInfo').hide();
                    getList();
                } else {
                    alert('网络异常，请稍后重试');
                } 
            },
            erro:function(err){
                console.log(err);
            }
        })
    })

    $("#cancleBtn").click(function(){
        $('#resetInfo').hide();
    })

})