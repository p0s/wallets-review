function populateWallets() {
    if (null === document.querySelector(".wallets")) {
        return false;
    }
    var template = document.querySelector('#maintemplate');
    var list = document.querySelector('.list-listings .row');
    var attrTpl = document.querySelector('#tagTemplate');

    for (var i = 0; i < wallets.length; i++) {
        var clone = document.importNode(template.content, true);

        clone.querySelector(".listing-title").innerText = wallets[i].label;
        clone.querySelector(".listing-title").href = "/apps/" + wallets[i].slug;
        clone.querySelector(".description").innerText = wallets[i].description;
        clone.querySelector(".recent-place-thumb object").data = "/apps/" + wallets[i].slug + "/logo.png";
        clone.querySelector(".recent-place-thumb a").href = "/apps/" + wallets[i].slug;

        var walletAttributes = wallets[i].attr;
        for (var j = 0; j < walletAttributes.length; j++) {
            var tagClone = document.importNode(attrTpl.content, true);

            clone.querySelector(".singleapp").setAttribute(
                "data-attributes", 
                (clone.querySelector(".singleapp").getAttribute("data-attributes") || "") + " " + walletAttributes[j]
            );

            var attributeExploded = walletAttributes[j].split("-");
            var attributeName = attributeExploded[0];
            var attributeValue = attributeExploded[1];
            
            var currentAttribute;
            var attributeClass = 'general';
            if (parseInt(attributeValue, 10) >= 0) {
                // Level attr
                currentAttribute = attributes[attributeName]['levels'][attributeValue];
            } else {
                // Multi attr
                currentAttribute = attributes[attributeName]['multi'][attributeValue];
            }
            if (undefined !== sentimentClasses[currentAttribute.sentiment]) {
                attributeClass = sentimentClasses[currentAttribute.sentiment];
            }
            
            if (attributeName == "chains") {
                var blackIconPath = "/images/cryptocurrency-icons/32/black/"+ attributeValue +".png";
                tagClone.querySelector(".attribute").innerHTML = "<a href='/coins.html#"+attributeValue+"'><img width='32' height='32' src='"+blackIconPath+"'></a>";
                $(tagClone.querySelector(".attribute")).addClass("chainIcon");
                tagClone.querySelector(".attribute").title = currentAttribute.label;
                clone.querySelector(".chain-list").appendChild(tagClone);
            } else {
                $(tagClone.querySelector(".attribute")).addClass(attributeClass);
                tagClone.querySelector(".attribute").innerHTML = "<a href='/attributes.html#"+attributeName+"'>"+currentAttribute.label+"</a>";
                tagClone.querySelector(".attribute").title = currentAttribute.description;
                clone.querySelector(".rated-list").appendChild(tagClone);
            }
        }

        list.appendChild(clone);
    }
}

function populateAttributes() {
    if (document.querySelector(".wallets")) {
        var row = document.querySelector(".filter-by-tags .row");
        var template = document.querySelector("#tagInFilterTemplate-radio");
        var template2 = document.querySelector("#tagInFilterTemplate-checkbox");
        var cbt = document.querySelector("#collapseButtonTemplate");
        var collapseDivTemplate = document.querySelector("#collapseDivTemplate");
        var mainLabelTemplate = document.querySelector("#mainLabelTemplate");

        for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {

                var divClone = document.importNode(collapseDivTemplate.content, true);
                divClone.querySelector("div").setAttribute("id", key);

                if (undefined !== attributes[key]['label']) {
                    var mainLabel = document.importNode(mainLabelTemplate.content, true);
                    mainLabel.querySelector(".mainLabel").innerText = attributes[key]['label'];
                    divClone.appendChild(mainLabel);
                }

                // var cbtClone = document.importNode(cbt.content, true);
                // var button = cbtClone.querySelector("button");
                // button.setAttribute("data-target", key);
                // button.setAttribute("aria-controls", key);
                // button.innerText = key;
                // row.appendChild(cbtClone);

                // TODO Debug collapsibles. Right now the whole collapsible div that should house a category of filters
                // will be appended to the row empty, despite instructions below clearly telling divClone to append
                // children (i.e. attribute filters). They're not ending up inside the element, but as if appended to
                // row instead.

                if (undefined !== attributes[key]['levels']) {
                    // Levels mode
                    for (var j = 0; j < attributes[key]['levels'].length; j++) {

                        if (attributes[key]['levels'][j].filter === false) {
                            continue;
                        }
                        var id = key + "-" + j;

                        // Iterate through levels
                        var clone = document.importNode(template.content, true);
                        var input = clone.querySelector("input");
                        input.id = id;
                        input.value = id;
                        input.name = key;
                        
                        var label = clone.querySelector("label");
                        label.setAttribute("for", id);
                        label.innerText = attributes[key]['levels'][j].label;

                        divClone.appendChild(clone);
                    }
                    
                } else if (undefined !== attributes[key]['multi']) {
                    // Multi mode
                    for (var key2 in attributes[key]['multi']) {
                        if (attributes[key]['multi'].hasOwnProperty(key2)) {
                            var id = key + "-" + key2;

                            if (attributes[key]['multi'][key2].filter === false) {
                                continue;
                            }
    
                            // Iterate through levels
                            var clone = document.importNode(template2.content, true);

                            var input = clone.querySelector("input");
                            input.id = id;
                            input.value = id;
                            input.name = id;
                            
                            var label = clone.querySelector("label");
                            label.setAttribute("for", id);
                            label.innerText = attributes[key]['multi'][key2].label;

                            divClone.appendChild(clone);
                        }
                    }
                }
                row.appendChild(divClone);
                row.innerHTML = row.innerHTML +"<div class='separator'></div>";
            }
        }
        initFiltering();
    }

    if ($(".faqs").length) {
        var attrTpl = document.querySelector('#tagTemplate');
        $(".faqs-box").each(function(i, el){
            var selectedAttribute = attributes[$(el).attr("data-attribute")];
            if (!selectedAttribute) {
                return "skip";
            }

            if (undefined !== selectedAttribute['multi']) {
                el.querySelector("div").innerHTML += "<p>A wallet can have multiple values of this attribute.</p>"
                for (var key in selectedAttribute['multi']) {
                    if (selectedAttribute['multi'].hasOwnProperty(key)) {
                        renderTag($(el).attr("data-attribute")+"-"+key, selectedAttribute.multi[key]);
                    }
                }
            } else if (undefined !== selectedAttribute['levels']) {
                if (selectedAttribute.levels.length > 1) {
                    el.querySelector("div").innerHTML += "<p>A wallet can have only one value of this attribute.</p>"
                } else {
                    el.querySelector("div").innerHTML += "<p>This is a boolean attribute - a wallet either has it or doesn't.</p>"
                }
                for (var j = 0; j < selectedAttribute.levels.length; j++) {
                    renderTag(j, selectedAttribute.levels[j]);
                }
            }
            
            function renderTag(index, element) {
                var tagClone = document.importNode(attrTpl.content, true);
                var attributeClass = 'general';
                if (element.sentiment) {
                    attributeClass = sentimentClasses[element.sentiment];
                }

                if ("string" === typeof index && index.indexOf("chain") > -1) {
                    var attributeName = index.split("-")[0];
                    var attributeValue = index.split("-")[1];
                    var blackIconPath = "/images/cryptocurrency-icons/32/black/"+ attributeValue +".png";
                    tagClone.querySelector(".attribute").innerHTML = "<a href='/coins.html#"+attributeValue+"'><img width='32' height='32' src='"+blackIconPath+"'></a>";
                    $(tagClone.querySelector(".attribute")).addClass("chainIcon");
                    tagClone.querySelector(".attribute").title = element.label;
                } else {
                    $(tagClone.querySelector(".attribute")).addClass(attributeClass);
                    tagClone.querySelector(".attribute").innerHTML = "<a href='#'>"+element.label+"</a>";
                    tagClone.querySelector(".attribute").title = element.description;
                }
                el.querySelector("div").appendChild(tagClone);
    
            }

        });
    }

    if ($(".category-widget").length) {
        var attrTpl = document.querySelector('#tagTemplate');
        for (var i = 0; i < wallets.length; i++) {
            if (wallets[i].slug == currentApp) {
                // App selected
                var attrs = wallets[i].attr;
                for (var j = 0; j < attrs.length; j++) {
                    var tagClone = document.importNode(attrTpl.content, true);

                    var element = attrs[j];
                    
                    var attributeExploded = attrs[j].split("-");
                    var attributeName = attributeExploded[0];
                    var attributeValue = attributeExploded[1];
                    
                    var currentAttribute;
                    var attributeClass = 'general';
                    if (parseInt(attributeValue, 10) >= 0) {
                        // Level attr
                        currentAttribute = attributes[attributeName]['levels'][attributeValue];
                    } else {
                        // Multi attr
                        currentAttribute = attributes[attributeName]['multi'][attributeValue];
                    }
                    if (undefined !== sentimentClasses[currentAttribute.sentiment]) {
                        attributeClass = sentimentClasses[currentAttribute.sentiment];
                    }
                    
                    if (attributeName == "chains") {
                        var blackIconPath = "/images/cryptocurrency-icons/32/black/"+ attributeValue +".png";
                        tagClone.querySelector(".attribute").innerHTML = "<a href='/coins.html#"+attributeValue+"'><img width='32' height='32' src='"+blackIconPath+"'></a>";
                        $(tagClone.querySelector(".attribute")).addClass("chainIcon");
                        tagClone.querySelector(".attribute").title = currentAttribute.label;
                    } else {
                        $(tagClone.querySelector(".attribute")).addClass(attributeClass);
                        tagClone.querySelector(".attribute").innerHTML = "<a href='/attributes.html#"+attributeName+"'>"+currentAttribute.label+"</a>";
                        tagClone.querySelector(".attribute").title = currentAttribute.description;

                        tagClone.querySelector("div").innerHTML += "<div class='attribute-special-description'>"+currentAttribute.description;+"</div>";
                        document.querySelector(".category-widget").innerHTML += tagClone.querySelector("div").innerHTML;
                    }
                    
                    
                    
                }
            }
        }
    }
}

function initFiltering() {
    $("#resetFilters").click(resetFilters);
    $(".do-tonight-sec a").on("click", function(e){
        resetFilters();
        var attr = $(e.currentTarget).attr("data-attribute");
        $(".arrow-down.floating").click();
        $("input#"+attr).click();
    });
    $(".filter-by-tags input").on("change", function(e){
        var arrayOfSelectedTags = [];
        $(".filter-by-tags input:checked").each(function(i, el){
            arrayOfSelectedTags.push($(el).attr("id"));
        });
        
        $(".singleapp").each(function(i, el){
            var presentTags = $(el).attr("data-attributes").trim().split(" ");
            var hasNeededTags = arrayOfSelectedTags.every(elem => presentTags.indexOf(elem) > -1);
            if (!hasNeededTags) {
                $(el).hide();
            } else {
                $(el).show();
            }
        });
    });
}

function resetFilters() {
    $(".filter-by-tags input").prop("checked", false).change();
}

function populateMenus() {
    if ($(".appMenuList").length) {
        for (var i = 0; i < wallets.length; i++) {
            var newItem = "<li><a href='/apps/"+ wallets[i].slug +"'>"+ wallets[i].label +"</a></li>";
            for (var j = 0; j < document.querySelectorAll(".appMenuList").length; j++) {
                document.querySelectorAll(".appMenuList")[j].innerHTML += newItem;
            }
        }
    }
}

function populateCoins() {
    if ($(".coins").length) {
        var template = document.querySelector("#coinTemplate");
        for (key in attributes['chains']['multi']) {
            if (attributes['chains']['multi'].hasOwnProperty(key)) {
                var clone = document.importNode(template.content, true);
                clone.querySelector("img").src = "/images/cryptocurrency-icons/32@2x/black/" + key + "@2x.png";
                clone.querySelector(".number").innerText = key.toUpperCase();
                clone.querySelector(".work-detail h3").innerText = attributes['chains']['multi'][key].label;
                clone.querySelector(".how-it-works").id = key;
                clone.querySelector(".work-detail div.description").innerHTML = makeDescription(attributes['chains']['multi'][key].description);
                clone.querySelector(".work-detail ul").innerHTML = listLinks(attributes['chains']['multi'][key].links);
            }
            document.querySelector(".coins").appendChild(clone);
        }

    }
}

function listLinks(jso) {
    var litems = "";
    for (key in jso) {
        if (jso.hasOwnProperty(key)) {
            var obj = jso[key];
            litems += "<li><a target='_blank' href='"+obj.href+"' title='"+obj.title+"'>"+obj.title+"</a></li>"
        }
    }
    return litems;
}

function makeDescription(paragraphs) {
    if ("string" === typeof paragraphs) {
        paragraphs = [paragraphs];
    }
    var desc = '';
    for (var i = 0; i < paragraphs.length; i++) {
        desc += "<p>" + paragraphs[i] + "</p>";
    }
    return desc;
}

var sentimentClasses = {
    "-1": "n2",
    "-0.5": "n1",
    "0": "general",
    "0.5": "p1",
    "1": "p2"
}

$(document).ready(function(){
    populateWallets(); 
    populateAttributes();
    populateMenus();
    populateCoins();
});

var wallets = [
    {
        "label": "Status",
        "website": "https://status.im",
        "description": "Status is a decentralized messenger for Ethereum with a built-in dapp browser and crypto wallet.",
        "attr": [
            "censorship-3", 
            "dapps-2", 
            "ux-1", 
            "chains-eth", 
            "custom_net-2", 
            "os-ios", 
            "os-android", 
            "open_source-2", 
            "keys-2", 
            "stability-0",
            "ens-2",
            "qr-eip_681_no"
        ],
        "slug": "status"
    },
    {
        "label": "Opera",
        "website": "https://opera.com",
        "description": "A mainstream browser turned crypto-friendly, Opera now supports a wide range of Ethereum blockchain operations",
        "attr": [
            "censorship-0",
            "dapps-2",
            "ux-3",
            "chains-eth", 
            "custom_net-2", 
            "os-android",
            "custom_token-erc20",
            "custom_token-erc721",
            "open_source-0",
            "keys-1",
            "stability-2",
            "ens-2",
            "qr-bip_21",
            "qr-eip_681_no"
        ],
        "slug": "opera"
    },
    {
        "label": "Trust Wallet",
        "website": "https://trustwallet.com/",
        "description": "A multi-chain wallet acquired by Binance with some advanced features like coin staking and more",
        "attr": [
            "censorship-1", 
            "dapps-2", 
            "ux-3", 
            "multichain-0",
            "chains-eth",
            "chains-btc",
            "chains-etc",
            "chains-go",
            "chains-poa",
            "chains-vet",
            "chains-trx",
            "chains-wan",
            "chains-clo",
            "chains-ltc",
            "chains-bch",
            "chains-tomo",
            "chains-dash",
            "chains-zec",
            "chains-xzc",
            "chains-xrp",
            "chains-kin",
            "chains-nim",
            "chains-tt",
            "chains-aion",
            "custom_net-0",
            "os-ios",
            "os-android",
            "custom_token-erc20",
            "custom_token-erc721",
            "open_source-1",
            "keys-1",
            "stability-2",
            "ens-0",
            "authentication-biometric",
            "qr-bip_21",
            "qr-eip_681_no"
        ],
        "slug": "trust"
    },
    // {
    //     "label": "LETH",
    //     "attr": "stability-0"
    // }
]

// Opera:

/*
- address only = (ok)
- address + amount decimal = wei (OK)
- address + amount float = Eth (OK)
- address + value decimal = wei (OK)
- address + value decimal + Eth unit = Eth (OK)
- address + value float = Eth (OK)
- address + value float + Eth unit = OK
- amount + value = value

- address + value 1e18 = value in eth (off by 10^18)
- ENS scan = no
- "to" scan = no
- amount & value in e^ = value in eth (off by 10^18)
- value in e^ & amount = value in eth (off by 10^18)
*/

// Status:

/*
- address only (OK)
- address + value decimal = wei (OK)
- amount 1 + value 1e18 = 1 eth (OK) (takes value)
- value 1e18 = 1 eth (OK)
- value 1e18 + amount 1 = 1 eth (OK) (takes value)
- value in wei, 5000000000000000 = OK in eth
- address + amount decimal = address
- address + amount float  = address
- address + value float = NOT OK wei (100.5 = 1005)
- ENS scan = no
- "to" scan = no
- value 1 + Eth unit = error
- value in wei + unit = address
*/

// Trust

/*
- address only OK
- address + amount dec = address + value in eth
- address + amount float = address + value in eth
- address + value dec = address + value in eth
- address + value float = address + value in eth
- value 1 + Eth unit = OK
- value 1.1 + Eth unit = OK
- amount + value / value + amount = picks value OK

- to / ENS = fail
- scientific notation = nope
*/

// ethereum:to:bitfalls.eth
// ethereum:bitfalls.eth
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da
// ethereum:to:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?amount=100
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?amount=100.5
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=100
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=100.5
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=1+ETH
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=1e18
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=50000000000000000
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=50000000000000000+WEI
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?value=1e18&amount=1
// ethereum:0xf5d93C0479e3Fe57394E88cf24aBaDf570B991da?amount=1&value=1e18

var attributes = {

        "censorship": {
            "label": "Censorship Resistance",
            "levels": [
                {
                    "label": "Highly censorable",
                    "sentiment": -1,
                    "description": "A single party can decide you no longer have access to the blockchain"
                },
                {
                    "label": "Censorable",
                    "sentiment": -0.5,
                    "description": "A coordinated attack or a large scale system failure will prevent you from accessing the blockchain",
                },
                {
                    "label": "Uncensorable",
                    "sentiment": 0.5,
                    "description": "It's very difficult to prevent this app from working. A coordinated attack on a large scale is necessary."
                },
                {
                    "label": "Unstoppable",
                    "sentiment": 1,
                    "description": "This application is essentially as resilient as the blockchain it connects to."
                }
            ],
            "description": "How hard would it be for someone to stop you from using this app?"
        },

        "dapps": {
            "label": "Dapp Support",
            "levels": [
                {
                    "label": "No dapps",
                    "sentiment": -0.5,
                    "description": "No dapp support, wallet only."
                },                
                {
                    "label": "Blockchain 1.0",
                    "sentiment": 0,
                    "description": "The underlying blockchain is lacking features that would support a dapp ecosystem."
                },
                {
                    "label": "Basic Dapps",
                    "sentiment": 0.5,
                    "description": "Basic Web3 or equivalent is injected into the browser by the wallet."
                },
                {
                    "label": "Advanced Dapps",
                    "sentiment": 1,
                    "description": "A feature rich dapp browser with a rich ecosystem and/or excellent web3 functionality available."
                }
            ]
        },

        "ux": {
            "label": "User Experience",
            "levels": [
                {
                    "label": "Hard to use",
                    "sentiment": -1,
                    "description": "This app is difficult or frustrating to use and requires patience or technical expertise."
                },
                {
                    "label": "UX lacking",
                    "sentiment": -0.5,
                    "description": "Stability issues or UX uncertainties plague this app."
                },
                {
                    "label": "Good UX",
                    "sentiment": 0.5,
                    "description": "This app is relatively easy to use."
                },
                {
                    "label": "Excellent UX",
                    "sentiment": 1,
                    "description": "This app is extremely intuitive and newbie friendly."
                },
            ]
        },

        "defi": {
            "label": "Decentralized Finance",
            "multi": {
                "uniswap": {
                    "label": "Uniswap 🦄",
                    "description": "Application has built-in support for https://uniswap.exchange.",
                    "sentiment": 0.5
                },
                "compound": {
                    "label": "Compound 💸",
                    "description": "Application has built-in support for https://compound.finance.",
                    "sentiment": 0.5
                },
                "maker": {
                    "label": "MakerDAO 💵",
                    "description": "Application has built-in support for https://cdp.makerdao.com.",
                    "sentiment": 0.5
                },
                "dharma": {
                    "label": "Dharma ☸",
                    "description": "Application has built-in support for https://dharma.io.",
                    "sentiment": 0.5
                },
                "nuo": {
                    "label": "Nuo 🆕",
                    "description": "Application has built-in support for https://nuo.network.",
                    "sentiment": 0.5
                }
            }
        },

        "qr": {
            "label": "QR Code Support",
            "multi": {
                "basic": {
                    "label": "QR: Address",
                    "description": "The application's QR scanner has basic recipient address scanning capability.",
                    "sentiment": 0,
                    "total_sentiment": false,
                    "filter": false
                },
                "amount_bad": {
                    "label": "QR: ?amount ❌",
                    "sentiment": -0.5,
                    "description": "Amount is a field from the BIP21 standard. As such, any value passed in this way should be ether, not wei. In this case, when passing in integers, e.g. amount=50, the wallet interprets it as 50 Wei. When passing in floats, e.g. amount=50.0 the app interprets it as 50.0 ether. This inconsistency is dangerous.",
                    "total_sentiment": false,
                    "filter": false
                },
                "amount_good": {
                    "label": "QR: ?amount ✅",
                    "description": "Application supports the ?amount parameter as specified by BIP21 - it's always in ether, never in wei.",
                    "sentiment": 0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_bad_int": {
                    "label": "QR: ?value={int} ❌",
                    "sentiment": -0.5,
                    "description": "Integer input of value should result in a value in wei being entered into the amount field.",
                    "total_sentiment": false,
                    "filter": false
                },
                "value_good_int": {
                    "label": "QR: ?value={int} ✅",
                    "sentiment": 0.5,
                    "description": "Integer input of value should result in a value in wei being entered into the amount field.",
                    "total_sentiment": false,
                    "filter": false
                },
                "value_bad_float": {
                    "label": "QR: ?value={float} ❌",
                    "sentiment": -0.5,
                    "description": "A number with a floating point should represent amount of Ether to send.",
                    "total_sentiment": false,
                    "filter": false
                },
                "value_good_float": {
                    "label": "QR: ?value={float} ✅",
                    "sentiment": 0.5,
                    "description": "A number with a floating point should represent amount of Ether to send.",
                    "total_sentiment": false,
                    "filter": false
                },
                "value_int_unit_good": {
                    "label": "QR: ?value={int}+ETH ✅",
                    "description": "A whole number with a \"+ETH\" suffix shows the value in ether, as per EIP-681.",
                    "sentiment": 0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_int_unit_bad": {
                    "label": "QR: ?value={int}+ETH ❌",
                    "description": "Including a suffix after the whole number value breaks things.",
                    "sentiment": -0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_float_unit_good": {
                    "label": "QR: ?value={float}+ETH ✅",
                    "description": "A floating point number with a \"+ETH\" suffix shows the value in ether, as per EIP-681.",
                    "sentiment": 0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_float_unit_bad": {
                    "label": "QR: ?value={float}+ETH ❌",
                    "description": "A floating point number with a \"+ETH\" suffix shows the value in ether, as per EIP-681.",
                    "sentiment": -0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_scientific_good": {
                    "label": "QR: ?value=1e18 ✅",
                    "description": "Value entered in scientific notation gets converted to base unit correctly",
                    "sentiment": 0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_scientific_bad": {
                    "label": "QR: ?value=1e18 ❌",
                    "description": "Value entered in scientific notation produces an error or wrong input.",
                    "sentiment": -0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_scientific_unit_good": {
                    "label": "QR: ?value=1e18+ETH ✅",
                    "description": "Value entered in scientific notation followed by unit parses the correct value.",
                    "sentiment": 0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_scientific_unit_bad": {
                    "label": "QR: ?value=1e18+ETH ❌",
                    "description": "Value entered in scientific notation followed by unit produces an error or wrong input.",
                    "sentiment": -0.5,
                    "total_sentiment": false,
                    "filter": false
                },
                "value_amount": {
                    "label": "v+a=v",
                    "description": "Providing both value and amount picks value.",
                    "sentiment": 0,
                    "filter": false
                },
                "amount_value": {
                    "label": "v+a=a",
                    "description": "Providing both value and amount picks amount.",
                    "sentiment": 0,
                    "filter": false
                },
                "value_amount_bad": {
                    "label": "!v+e",
                    "description": "Providing both value and amount breaks the app.",
                    "sentiment": -0.5,
                    "filter": false
                },
                "eip_831": {
                    "label": "EIP-831 ✅",
                    "sentiment": 0.5,
                    "description": "For upgradeability, EIP-831 specifies that EIP-681 use the pay- prefix, like so: ethereum:pay-0x7492734973..dafe0?value=..."
                },
                "eip_831_bad": {
                    "label": "EIP-831 ❌",
                    "sentiment": -0.5,
                    "description": "For upgradeability, EIP-831 specifies that EIP-681 use the pay- prefix, like so: ethereum:pay-0x7492734973..dafe0?value=... This application errors or does not parse URIs with the pay- prefix."
                },
                "eip_681": {
                    "label": "EIP-681 ✅",
                    "description": "This application fully supports EIP-681 with value params, units, and scientific notation",
                    "sentiment": 1
                },
                "eip_681_no": {
                    "label": "EIP-681 ❌",
                    "description": "This application is not EIP-681 compatible",
                    "sentiment": -0.5
                },
                "bip_21": {
                    "label": "BIP-21 ✅",
                    "description": "This application supports the BIP-21 standard.",
                    "sentiment": 0.5
                }

            }
        },

        "ens": {
            "label": "ENS support",
            "levels": [
                {
                    "label": "No ENS",
                    "description": "This application has no ENS support. Addresses must be entered in hex format.",
                    "sentiment": -0.5
                },
                {
                    "label": "Own ENS",
                    "description": "This application has its own ENS and does not support the public ENS directly.",
                    "sentiment": 0
                },
                {
                    "label": "ENS",
                    "description": "This application fully supports the Ethereum Name Service",
                    "sentiment": 1
                }
            ]
        },

        "multichain": {
            "label": "Multi-chain",
            "levels": [
                {
                    "label": "Multiple blockchains",
                    "sentiment": 1,
                    "description": "This wallet can be used to interact with several different blockchains."
                }
            ]
        },

        "chains": {
            "label": "Supported Blockchains",
            "multi": {
                "eth": {
                    "label": "Ethereum",
                    "description": ["The first advanced blockchain featuring truly programmable money.","Arguably the most advanced secure blockchain today with version 2.0 on the way. Find out more at Two Point Oh (link below)."],
                    "links": [
                        {
                            title: "Website",
                            href: "https://ethereum.org"
                        },
                        {
                            title: "Detailed introduction",
                            href: "https://bitfalls.com/2017/09/19/what-ethereum-compare-to-bitcoin/"
                        },
                        {
                            title: "Official Subreddit",
                            href: "https://reddit.com/r/ethereum"
                        },
                        {
                            title: "Two Point Oh: Ethereum 2.0 explainers",
                            href: "https://our.status.im/tag/two-point-oh"
                        }
                    ]
                },
                "etc": {
                    "label": "Ethereum Classic",
                    "description": "A version of Ethereum that kept a controversial incident in the blockchain's history instead of deleting it. The majority of the ecosystem went with the deletion.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://ethereumclassic.org/"
                        }
                    ]
                },
                "go": {
                    "label": "GoChain",
                    "description": "Enterprise focused web3-oriented blockchain.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://gochain.io/"
                        }
                    ]
                },
                "poa": {
                    "label": "POA Network",
                    "description": "A side-chain for Ethereum facilitating faster and cheaper, but less secure transactions.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://poa.network/"
                        }
                    ]
                },
                "wan": {
                    "label": "Wanchain",
                    "description": "A distributed financial infrastructure that seamlessly connects blockchain networks together",
                    "links": [
                        {
                            title: "Website",
                            href: "https://wanchain.org/"
                        }
                    ]
                },
                "clo": {
                    "label": "Callisto",
                    "description": "A version of Ethereum focused on inflationary earnings.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://callisto.network/"
                        }
                    ]
                },
                "icx": {
                    "label": "Icon",
                    "description": "A proof-of-authority for-profit blockchain/company.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://icon.foundation"
                        }
                    ]
                },
                "vet": {
                    "label": "VeChain",
                    "description": "A proof-of-authority for-profit blockchain/company.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.vechain.org/"
                        }
                    ]
                },
                "eos": {
                    "label": "EOS",
                    "description": "A proof-of-authority for-profit blockchain/company.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://eos.io/"
                        }
                    ]
                },
                "ltc": {
                    "label": "Litecoin",
                    "description": "A slightly modified copy of Bitcoin. Effectively bitcoin's testnet.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://litecoin.org/"
                        }
                    ]
                },
                "tomo": {
                    "label": "TomoChain",
                    "description": "A masternoded version of Ethereum",
                    "links": [
                        {
                            title: "Website",
                            href: "https://tomochain.com/"
                        }
                    ]
                },
                "dash": {
                    "label": "DASH",
                    "description": "Masternoded version of Bitcoin with optional privacy and high throughput.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.dash.org/"
                        }
                    ]
                },
                "zec": {
                    "label": "Zcash",
                    "description": "Zcash is a privacy-protecting, digital currency built on strong science.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://z.cash/"
                        }
                    ]
                },
                "xzc": {
                    "label": "Zcoin",
                    "description": "Private financial transactions, enabled by the Zerocoin Protocol.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://zcoin.io/"
                        }
                    ]
                },
                "trx": {
                    "label": "Tron",
                    "description": "A centralized and private version of Ethereum run on a single permissioned server.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://tron.network/"
                        }
                    ]
                },
                "xrp": {
                    "label": "Ripple",
                    "description": "Centralized attempt at a global remittance network",
                    "links": [
                        {
                            title: "Website",
                            href: "https://ripple.com/"
                        }
                    ]
                },
                "kin": {
                    "label": "Kin",
                    "description": "App-focused currency. Integration into products is focus.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.kin.org/"
                        }
                    ]
                },
                "nim": {
                    "label": "Nimiq",
                    "description": "A blockchain technology inspired by Bitcoin but designed to run in your browser. It is a fast and easy means of payment.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://nimiq.com"
                        }
                    ]
                },
                "tt": {
                    "label": "Thunder Token",
                    "description": "An EVM-compatible proof of stake chain.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.thundercore.com/"
                        }
                    ]
                },
                "aion": {
                    "label": "Aion",
                    "description": "Yet another superlative-packed web3 blockchain.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://aion.network/"
                        }
                    ]
                },
                "xlm": {
                    "label": "Stellar",
                    "description": "A more open version of Ripple. Global remittance network, decentralized and with token support.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.stellar.org/"
                        }
                    ]
                },
                "btc": {
                    "label": "Bitcoin",
                    "description": "The first blockchain.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://bitcoin.org/en/"
                        }
                    ]
                },
                "bch": {
                    "label": "Bitcoin Cash",
                    "description": "Bitcoin but faster, cheaper, smarter, and somewhat less secure.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://bitcoin.com"
                        }
                    ]
                },
                "xtz": {
                    "label": "Tezos",
                    "description": "A proof of stake web3 blockchain with full on-chain governance.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://tezos.com/"
                        }
                    ]
                },
                "ada": {
                    "label": "Cardano",
                    "description": "An in-development Proof of Stake web3 blockchain.",
                    "links": [
                        {
                            title: "Website",
                            href: "https://www.cardano.org/en/home/"
                        }
                    ]
                },
            }
        },

        "custom_net": {
            "label": "Custom RPC / Node",
            "levels": [
                {
                    "label": "No custom node support",
                    "sentiment": -0.5,
                    "description": "You cannot use your own node or a custom network."
                },
                {
                    "label": "Custom node",
                    "sentiment": 0.5,
                    "description": "You can connect this app to your own node but only to mainnet or predefined testnets."
                },
                {
                    "label": "Custom node and network ID",
                    "sentiment": 1,
                    "description": "You can connect to any network ID and custom node URL, from private PoA to mainnet."
                }
            ]
        },

        "os": {
            "label": "Operating Systems",
            "multi": {
                "ios": {
                    "label": "iOS",
                    "description": "iOS 10+ supported"
                },
                "android": {
                    "label": "Android",
                    "description": "Android 8+ supported"
                },
                "web": {
                    "label": "Web version",
                    "description": "A web UI on par with features in the mobile app"
                },
                "desktop-win": {
                    "label": "Desktop (Windows)",
                    "description": "A desktop UI on par with features in the mobile app"
                },
                "desktop-lin": {
                    "label": "Desktop (Linux)",
                    "description": "A desktop UI on par with features in the mobile app"
                },
                "desktop-osx": {
                    "label": "Desktop (OS X)",
                    "description": "A desktop UI on par with features in the mobile app"
                },
            }
        },

        "custom_token": {
            "label": "Token Standards",
            "multi": {
                "erc20": {
                    "label": "ERC20",
                    "description": "Custom tokens matching the ERC20 interface can be added to the built-in list, or are auto-detected.",
                    "sentiment": 1
                },
                "erc721": {
                    "label": "ERC721",
                    "description": "Custom collectibles (NFTs) adhering to the ERC721 interface can be added to the built-in list, or are auto-detected.",
                    "sentiment": 1
                }
            }
        },

        "open_source": {
            "label": "Source Code",
            "levels": [
                {
                    "label": "Closed Source",
                    "sentiment": -0.5,
                    "description": "This application's source cannot be inspected. You trust that it does what it says it does."
                },
                {
                    "label": "Partially Open Source",
                    "sentiment": 0.5,
                    "description": "Some parts of this application are open source and available for inspection."
                },
                {
                    "label": "Open Source",
                    "sentiment": 1,
                    "description": "This application is completely open source."
                }
            ]
        },

        "keys": {
            "label": "Key storage",
            "levels": [
                {
                    "label": "Custody 🔑",
                    "sentiment": -1,
                    "description": "The user is not in control of their keys or private keys are sent to any server at any point in time."
                },
                {
                    "label": "Risky 🔑",
                    "sentiment": -0.5,
                    "description": "It is not known if the browser sends a user's private keys to a server. This can be because the app enforces a VPN or is closed source.."
                },
                {
                    "label": "Own 🔑",
                    "sentiment": 1,
                    "description": "The user is in full control of their keys, either directly or through a recovery phrase."
                }
            ]
        },

        "stability" : {
            "label": "Stability",
            "levels": [
                {
                    "label": "In development",
                    "sentiment": -0.5,
                    "description": "The app should not be considered stable. Bugs happen and things can break."
                },
                {
                    "label": "Beta",
                    "sentiment": 0,
                    "description": "The feature set is complete and the bug-hunt is on. App is stable enough."
                },
                {
                    "label": "Stable",
                    "sentiment": 1,
                    "description": "The application should be considered stable and safe to use."
                },
            ]
        },

        "authentication": {
            "label": "Authentication",
            "multi": {
                "hw": {
                    "label": "Hardware wallet",
                    "description": "Application supports authentication through some manner of hardware wallet like Status Keycard, Trezor, Ledger Nano or similar."
                },
                "yubikey": {
                    "label": "Yubikey",
                    "description": "User can authenticate using a Yubikey."
                },
                "biometric": {
                    "label": "Biometric",
                    "description": "User can authenticate using face scan, fingerprint scan, or iris scan."
                }
            }
        }


}