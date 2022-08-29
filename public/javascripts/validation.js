// $(document).ready(function () {

  $('#table_id').DataTable();   //jquery data table
  
  
  
  $("#form").validate({
    errorClass: "validerrors",
    

    rules: {
      name: {         
          required: true,
          minlength: 3,
          lettersonly : true
          
        },

    

      email: {
        required: true,
        email: true
      },

      password: {
        required: true,
        minlength: 5
      },

      c_password: {
        required: true,
        minlength: 5,
        equalTo : "#password"
      },

      mobilenumber: {
          required: true,
          minlength: 10
        }

    }, messages : {

      name: {  
        required: "Enter first name",
        minlength: "Enter atleast 3 characters",
        // lettersonly: "Use alphabets only"
      },
     
      c_password: {
        equalTo : "Passwords doesn't match"
      },
    }
  })

 
// })

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

$("#form").validate({
  errorClass: "validerrors",
  

  rules: {
    First_Name: {         
        required: true,
        minlength: 3,
        lettersonly : true
        
      },

      Last_Name: {  
       required: true,
       minlength: 1,
       lettersonly : true
    }, 
    Company_Name: {  
      required: true,
      minlength: 1,
      lettersonly : true
   },

   Street_Address: {       
      required: true,
      minlength: 4,
      alphanumeric : true,
    },
    Town_City: {       
      required: true,
      minlength: 4,
      alphanumeric : true,
    },

    Country_State: {       
      required: true,
      minlength: 4,
      alphanumeric : true,
    },
    Post_Code: {
        required: true,
        minlength: 10
      },


      Phone: {
        required: true,
        minlength: 10
      },
      
      Alt_Phone: {
        required: true,
        minlength: 10
      },
      Coupon_Code: {       
        required: true,
        minlength: 4,
        alphanumeric : true,
      },

  }, messages : {

    firstname: {  
      required: "Enter first name",
      minlength: "Enter atleast 3 characters",
      // lettersonly: "Use alphabets only"
    },
    lastname: {          
      required: "Enter last name",
      minlength: "Enter atleast 3 characters",
      // lettersonly: "Use alphabets only "
    },
    firstname: {          
      required: "Enter first name",
      minlength: "Enter atleast 3 characters",
      // lettersonly: "No special characters allowed"
    },
    confirmpassword: {
      equalTo : "Passwords doesn't match"
    },
  }
})




// LettersOnly

jQuery.validator.addMethod("lettersonly", function(value, element) {
  return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please"); 

// Alphanumeric

jQuery.validator.addMethod("alphanumeric", function(value, element) {
  return this.optional(element) || /^[\w.]+$/i.test(value);
}, "Letters, numbers, and underscores only please");