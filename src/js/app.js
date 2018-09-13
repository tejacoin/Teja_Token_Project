App = {

    web3Provider : null ,
    contracts : {} ,
    account : {} ,
    loading : false ,
    tokenPrice : 10000000000000000 , 
    tokensSold: 0,
    tokensAvailable: 750000,


    init : function(){
        console.log(" App imitilized ... ");
        return App.initWeb3();
    },

    initWeb3 : function(){
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
          } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
          }
    
          return App.initContracts();
        
    },
  
  initContracts: function() {
    $.getJSON("TejaTokenSale.json", function(tejaTokenSale) {
      App.contracts.TejaTokenSale = TruffleContract(tejaTokenSale);
      App.contracts.TejaTokenSale.setProvider(App.web3Provider);
      App.contracts.TejaTokenSale.deployed().then(function(tejaTokenSale) {
        console.log(" Token Sale Address:", tejaTokenSale.address);
      });
    }).done(function(){
        $.getJSON("TejaToken.json", function(tejaToken) {
        App.contracts.TejaToken = TruffleContract(tejaToken);
        App.contracts.TejaToken.setProvider(App.web3Provider);
        App.contracts.TejaToken.deployed().then(function(tejaToken) {
         console.log(" TEJA Token Address:", tejaToken.address);
         });
         App.listenForEvents();  
         return App.render();
      });   
    });  
  },


  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.TejaTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0 ,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },


   render : function(){
      if(App.loading){
          return;
      }
      App.loading = true ;
    
      var loader  = $('#loader'); 
      var content = $('#content');
      
       loader.show();
       content.hide();

      // load account data 
    web3.eth.getCoinbase(function(err , account){
        if (err === null ) {
            App.account = account ; 
            $('#accountAddress').html('Your Accoun is : ' + account );
        };
    });

    
    //Load token sale contract
    App.contracts.TejaTokenSale.deployed().then(function(instance) {
        tejaTokenSaleInstance = instance;
        return tejaTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return tejaTokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
   
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.TejaToken.deployed().then(function(instance) {
          tejaTokenInstance = instance;
          return tejaTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.teja-balance').html(balance.toNumber());
           App.loading = false;
           loader.hide();
           content.show();
         })
      });
    },

    buyTokens: function() {
       $('#content').hide(); 
       $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.TejaTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // $('loader').hide();
        // $('content').show();
        // Wait for Sell event
      });
    }
  }
  


$(function(){
    $(window).load(function(){
        App.init();
    })
});