$(function(){
    $("input").on("click",function(){
        $($("li")).css('color', '#F3E9DD');
        var numberOfListItem = $("li").length;
        var randomChildNumber = Math.floor(Math.random()*numberOfListItem);
        $($("li").eq(randomChildNumber)).css('color', '#DAB88B');

        if(randomChildNumber == 0){
            $("#your-image").attr('src','/static/css/images/ramen2.jpg')
        }
        else if(randomChildNumber == 1){
            $("#your-image").attr('src','/static/css/images/rice2.jpg')
        }
        else if(randomChildNumber == 2){
            $("#your-image").attr('src','/static/css/images/dumpling.jpg')
        }
    });
});