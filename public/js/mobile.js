
var page = 1;
var pageSize=3;


// 获取列表信息
function getList(){
    $.get('/mobile/list',{
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
                        <td class='phoneID' style="display:none;">${ list[i]._id }</td>
                        <td>${i+1}</td>
                        <td class='phone-img'>
                            <img src="/phones/${list[i].fileName}"  />
                        </td>
                        <td class='phone-name'>${ list[i].phoneName }</td>
                        <td class='phone-brand'>${ list[i].phoneBrand }</td>
                        <td class='phone-gp'>${ list[i].phoneGuideP }</td>
                        <td class='phone-rp'>${ list[i].phoneRecoverP }</td>
                        <td>
                            <a class="updataPhone">修改</a>
                            <a class="deletePhone">删除</a>
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

    //默认调用
    getList();

    $("#addPhone").click(function(){
        $("#addPhoneWrap").show();
    });

    $("#cancel").click(function(){
        $("#addPhoneWrap").hide();
    })

    $("#add").click(function(){
        //新增手机

        var formData = new FormData();

        formData.append( 'phoneName',$("#phoneName").val() );
        formData.append( 'phoneBrand',$("#phoneBrand").find("option:selected").val() );
        formData.append( 'phoneGuideP',$("#phoneGuideP").val() );
        formData.append( 'phoneRecoverP',$("#phoneRecoverP").val() );
        formData.append( 'phoneImg',$("#phoneImg")[0].files[0] );

        $.ajax({
            url: '/mobile/add',
            method: 'post',
            data:formData,
            contentType:false,
            processData:false,
            success:function(result){
                console.log(6666666);
                if(result.code === 0){
                    $('#addPhoneWrap').hide();
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
    $('#list-body').on('click','.deletePhone',function(){
        var phoneId = $(this).parent().parent().find(".phoneID").html();
        $.get('/mobile/delete',{_id:phoneId},function(res){
            if(res.code === 0){
               getList();
            }
        })
    })

    //修改
    $('#list-body').on('click','.updataPhone',function(){
        $('#rewrite-phone').show();
        var name = $(this).parent().parent().find(".phone-name").html();
        var gp = $(this).parent().parent().find(".phone-gp").html();
        var rp = $(this).parent().parent().find(".phone-rp").html();
        var phone_brand = $(this).parent().parent().find(".phone-brand").html();
        var phoneId = $(this).parent().parent().find(".phoneID").html();

        $('#rewrite-name').val(name);
        $('#rewrite-gp').val(gp);
        $('#rewrite-rp').val(rp);
        $('#rewrite-brand').val(phone_brand);
        $('#rewrite-id').val(phoneId);
    })

    $("#rewrite-btn").click(function(){

        var formData = new FormData();
        formData.append( 'phoneId',$("#rewrite-id").val() );
        formData.append( 'phoneName',$("#rewrite-name").val() );
        formData.append( 'phoneBrand',$("#rewrite-brand").find("option:selected").val() );
        formData.append( 'phoneGuideP',$("#rewrite-gp").val() );
        formData.append( 'phoneRecoverP',$("#rewrite-rp").val() );
        formData.append( 'rewriteImg',$("#rewrite-img")[0].files[0] );
        

        $.ajax({
            url: '/mobile/updata',
            method: 'post',
            data:formData,
            contentType:false,
            processData:false,
            success:function(result){
                console.log(6666665);
                if(result.code === 0){
                    $('#rewrite-phone').hide();
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

    $("#rewrite-cancle").click(function(){
        $('#rewrite-phone').hide();
    })

})