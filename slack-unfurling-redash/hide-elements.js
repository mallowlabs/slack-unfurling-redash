module.exports.hideElements = function() {
    function iterateElements(className, fn) {
      let elements = document.getElementsByClassName(className);
      for (let i = 0; i < elements.length; ++i) {
        fn(elements[i]);
      }
    }

    function removeByClassName(className) {
      iterateElements(className, function(e) {
        e.remove();
      });
    }

    function toggleClass(className) {
      iterateElements(className, function(e) {
        e.classList.remove(className);
      });
    }

    try {
      removeByClassName('modebar');
      removeByClassName('hidden-print');
      removeByClassName('btn');
      removeByClassName('btn-group');
      const tiles = document.getElementsByClassName('tile');
      if (tiles.length) {
        tiles[0].style.marginBottom = '0px';
      }
      toggleClass('visible-print');
    } catch (err) {
      console.log('error!', err);
    }
  }
