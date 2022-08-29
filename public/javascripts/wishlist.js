
function addToWishlist(proId){
    $.ajax({
        url : '/addtowishlist/'+proId,
        method : 'get',
        success : (response) => {
            if(response.status){
                let count = $('#count').html()
               
                 count = parseInt(count) + 1
                location.reload()
                $(" #wishcount").load(location.href+" #wishcount")
                              
            }
        }
    })
}


// function addToWish(proId) {

//     console.log("enterted into ajax")

//     $.ajax({
//         url: '/addtowishlist/' + proId,
//         method: 'get',
//         success: (response) => {

//             if (response.status) {

//                 let count = $('#wishCount').html()
//                 count = parseInt(count) + 1
//                 $('#wishCount').load(location.href+ " #wishCount")

//             }

           


//         }

//     })


// }