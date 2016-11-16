function SearchModule(slext) {
    var self = this;
    this.startFuzzySearch = function() {
        $('.searchbox').remove();
        $('body').append(`<div class="searchbox" id="sl-search"><input type="text" class="searchboxInput" /><ul class="searchboxResultsList"></ul></div>`);
        $(".searchboxInput").focus();
        var currentSelection = 0;
        var h1 = $('.searchboxInput').on('input', function() {
            $('.searchboxResultsList').empty();
            var i = 5;
            var j = 0;
            while(i-- > 0) {
                while(j < slext.Files.length) {
                    if(slext.Files[j++].path.toLowerCase().includes($(this).val().toLowerCase())) {
                        $('.searchboxResultsList').append(`<li index="${j-1}"><span>${slext.Files[j-1].path}</span></li>`);
                        break;
                    }
                }
            }
            setSelected(0);
        });
        var setSelected = function(index) {
            var children = $('.searchboxResultsList').children();
            var selected = Math.min(Math.max(index, 0), children.length - 1);
            if (children.length != 0) {
                children.removeClass("search-result-selected");
                children.eq(selected).addClass("search-result-selected");
            }
            return selected;
        }

        var close = function() {
            h1.unbind();
            clickListener.unbind();
            $('.searchbox').remove();
        };

        var chooseItem = function() {
            slext.Files[$('.searchboxResultsList').children().eq(currentSelection).attr("index")].el.click();
        }

        $('.searchboxInput').keydown(function() {
            if(event.keyCode == 27) close();
            if (event.keyCode == 40) {event.preventDefault(); currentSelection = setSelected(currentSelection + 1);}
            if (event.keyCode == 38) {event.preventDefault(); currentSelection = setSelected(currentSelection - 1);}
            if (event.keyCode == 13) {
                chooseItem();
                close();
            };
        });

        var clickListener = $(document).click(function(e) {
            if (!(e.target.id == "sl-search" || $(e.target).parents("#sl-search").size())) { 
                close();
            }
        });


        $('.searchbox').on("click", ".searchboxResultsList>li", function() {
            slext.Files[$(this).attr("index")].el.click();
            close();
        });
    }
    $(window).keydown(function(event) {
        if(event.altKey && event.keyCode == 80) { /* p */
            event.preventDefault();
            self.startFuzzySearch();
        }
    });
}



    