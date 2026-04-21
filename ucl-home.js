(function(){
  function formatUnit(v){return String(v).padStart(2,'0');}
  function updateCountdowns(){
    document.querySelectorAll('[data-countdown]').forEach(function(block){
      var target=new Date(block.getAttribute('data-countdown')).getTime();
      var diff=Math.max(0,target-Date.now());
      var total=Math.floor(diff/1000);
      var values={
        days:formatUnit(Math.floor(total/86400)),
        hours:formatUnit(Math.floor((total%86400)/3600)),
        minutes:formatUnit(Math.floor((total%3600)/60)),
        seconds:formatUnit(total%60)
      };
      Object.keys(values).forEach(function(unit){
        var node=block.querySelector('[data-unit="'+unit+'"]');
        if(node) node.textContent=values[unit];
      });
    });
  }
  updateCountdowns();
  setInterval(updateCountdowns,1000);

  var LIVE_BEFORE_MS=30*60*1000;
  var LIVE_AFTER_MS=180*60*1000;

  function formatTimer(ms){
    if(ms<=0) return 'Bientot';
    var total=Math.floor(ms/1000);
    var hours=Math.floor(total/3600);
    var minutes=Math.floor((total%3600)/60);
    var seconds=total%60;
    return formatUnit(hours)+'h '+formatUnit(minutes)+'m '+formatUnit(seconds)+'s';
  }

  function getViewerCount(card){
    var value=parseInt(card.getAttribute('data-current-viewers')||'0',10);
    return value>0?value:0;
  }

  function updateMatchCards(){
    var liveGrid=document.getElementById('liveGrid');
    var upcomingGrid=document.getElementById('upcomingGrid');
    var hasGroupedUpcoming=!!document.querySelector('[data-upcoming-group]');
    var liveEmpty=document.getElementById('liveEmpty');
    var liveCount=document.getElementById('liveCount');
    if(!liveGrid||(!upcomingGrid&&!hasGroupedUpcoming)) return;

    var liveTotal=0;
    var cards=Array.prototype.slice.call(document.querySelectorAll('[data-match-card]'));
    cards.sort(function(a,b){
      return new Date(a.getAttribute('data-start')).getTime()-new Date(b.getAttribute('data-start')).getTime();
    });

    cards.forEach(function(card){
      var start=new Date(card.getAttribute('data-start')).getTime();
      var openAt=start-LIVE_BEFORE_MS;
      var closeAt=start+LIVE_AFTER_MS;
      var now=Date.now();
      var isLive=now>=openAt&&now<=closeAt;
      var isFinished=now>closeAt;
      var timer=card.querySelector('[data-timer]');
      var status=card.querySelector('[data-status]');
      var viewers=card.querySelector('[data-viewers]');

      if(isLive){
        liveTotal++;
        liveGrid.appendChild(card);
        if(status) status.hidden=false;
        if(timer) timer.hidden=true;
      }else{
        var sportCategory=(card.getAttribute('data-sport-category')||'').toLowerCase();
        var categoryGrid=document.querySelector('[data-upcoming-group="'+sportCategory+'"]');
        (categoryGrid||upcomingGrid).appendChild(card);
        if(status) status.hidden=true;
        if(timer){
          timer.hidden=false;
          timer.textContent=isFinished?'Termine':formatTimer(openAt-now);
          timer.classList.toggle('timer-green',openAt-now<=2*60*60*1000);
          timer.classList.toggle('timer-orange',openAt-now>2*60*60*1000&&openAt-now<=24*60*60*1000);
          timer.classList.toggle('timer-red',openAt-now>24*60*60*1000);
        }
      }

      if(viewers){
        viewers.textContent=getViewerCount(card);
      }
    });

    if(liveEmpty){
      liveEmpty.classList.toggle('visible',liveTotal===0);
    }
    if(liveCount){
      liveCount.textContent=liveTotal?liveTotal+' EN COURS':'';
    }
  }

  updateMatchCards();
  setInterval(updateMatchCards,1000);

  function updateRefreshStamp(message){
    var stamp=document.getElementById('refreshStamp');
    if(!stamp) return;
    if(message){
      stamp.textContent=message;
      return;
    }
    var now=new Date();
    stamp.textContent='Mis a jour a '+formatUnit(now.getHours())+'H'+formatUnit(now.getMinutes());
  }

  updateRefreshStamp();

  var homeRefreshBtn=document.getElementById('homeRefreshBtn');
  if(homeRefreshBtn){
    homeRefreshBtn.addEventListener('click',function(){
      if(homeRefreshBtn.classList.contains('is-loading')){
        return;
      }
      homeRefreshBtn.classList.add('is-loading');
      homeRefreshBtn.textContent='Actualisation...';
      updateCountdowns();
      updateMatchCards();
      updateRefreshStamp('Actualisation en cours...');
      setTimeout(function(){
        window.location.reload();
      },300);
    });
  }

  document.addEventListener('contextmenu',function(event){
    event.preventDefault();
  });

  var iptvPromoOverlay=document.getElementById('iptvPromoOverlay');
  var iptvPromoBtn=document.getElementById('iptvPromoBtn');
  var iptvPromoClose=document.getElementById('iptvPromoClose');

  if(iptvPromoOverlay){
    document.body.classList.add('modal-open');
  }

  function closeIptvPromo(){
    if(iptvPromoOverlay){
      iptvPromoOverlay.hidden=true;
      document.body.classList.remove('modal-open');
    }
  }

  if(iptvPromoBtn){
    iptvPromoBtn.addEventListener('click',function(){
      closeIptvPromo();
    });
  }

  if(iptvPromoClose){
    iptvPromoClose.addEventListener('click',function(){
      closeIptvPromo();
    });
  }

  document.querySelectorAll('.watch-link[data-match-href]').forEach(function(button){
    button.addEventListener('click',function(){
      var matchHref=button.getAttribute('data-match-href')||'';
      if(matchHref){
        window.location.href=matchHref;
      }
    });
  });
})();
