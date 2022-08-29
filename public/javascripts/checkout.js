
// {{!-- validation script --}}

<script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.3/dist/jquery.validate.js"></script>



    //input field validation
   
        $.validator.addMethod("alpha", function (value, element) {
            return this.optional(element) || value == value.match(/^[a-zA-Z\s]+$/);
        });
        $('#checkout-form').validate({
            rules: {
                First_Name: {
                    required: true,
                    alpha: true,
                    minlength: 3,
                },
                Last_Name: {
                    required: true,
                    alpha: true
                },
                Company_Name: {
                    required: true,
                    minlength: 3
                },
                Street_Address: {
                    required: true,
                    minlength: 3
                },
                Extra_Details: {
                    required: true,
                    minlength: 3
                },
                Town_City: {
                    required: true,
                    alpha: true,
                    minlength: 3
                },
                Country_State: {
                    required: true,
                    alpha: true,
                    minlength: 3
                },
                Post_Code: {
                    required: true,
                    digits: true,
                    minlength: 6,
                    maxlength: 6
                },
                Phone: {
                    required: true,
                    digits: true,
                    minlength: 10,
                    maxlength: 10
                },
                Alt_Phone: {
                    required: true,
                    digits: true,
                    minlength: 10,
                    maxlength: 10
                },
                Pay_Method: {
                    required: true
                }
            },
            messages: {
                First_Name: {
                    alpha: "Name should be in alphabets"
                },
                Last_Name: {
                    alpha: "Name should be in alphabets"
                },
                Town_City: {
                    alpha: "This field should be in alphabets"
                },
                Country_State: {
                    alpha: "This field should be in alphabets"
                },
                Post_Code: {
                    digits: "Post code should be of digits"
                },
                Phone: {
                    digits: "Mobile should be of digits"
                },
                Alt_Phone: {
                    digits: "Mobile should be of digits"
                },
                Pay_Method: {
                    required: "Choose a payment method"
                }
            },
        })
