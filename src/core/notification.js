'use strict';

var corefn = ({
  notify: function( params ){
    var _p = this._private;

    if( _p.batchingNotify ){
      var bEles = _p.batchNotifyEles;
      var bTypes = _p.batchNotifyTypes;

      if( params.collection ){
        bEles.merge( params.collection );
      }

      if( !bTypes.ids[ params.type ] ){
        bTypes.push( params.type );
        bTypes.ids[ params.type ] = true;
      }

      return; // notifications are disabled during batching
    }

    if( !_p.notificationsEnabled ){ return; } // exit on disabled

    var renderer = this.renderer();

    renderer.notify(params);
  },

  notifications: function( bool ){
    var p = this._private;

    if( bool === undefined ){
      return p.notificationsEnabled;
    } else {
      p.notificationsEnabled = bool ? true : false;
    }
  },

  noNotifications: function( callback ){
    this.notifications(false);
    callback();
    this.notifications(true);
  },

  startBatch: function(){
    var _p = this._private;

    if( _p.batchCount == null ){
      _p.batchCount = 0;
    }

    if( _p.batchCount === 0 ){
      _p.batchingStyle = _p.batchingNotify = true;
      _p.batchStyleEles = this.collection();
      _p.batchNotifyEles = this.collection();
      _p.batchNotifyTypes = [];

      _p.batchNotifyTypes.ids = {};
    }

    _p.batchCount++;

    return this;
  },

  endBatch: function(){
    var _p = this._private;

    _p.batchCount--;

    if( _p.batchCount === 0 ){
      // update style for dirty eles
      _p.batchingStyle = false;
      _p.batchStyleEles.updateStyle();

      // notify the renderer of queued eles and event types
      _p.batchingNotify = false;
      this.notify({
        type: _p.batchNotifyTypes,
        collection: _p.batchNotifyEles
      });
    }

    return this;
  },

  batch: function( callback ){
    this.startBatch();
    callback();
    this.endBatch();

    return this;
  },

  // for backwards compatibility
  batchData: function( map ){
    var cy = this;

    return this.batch(function(){
      for( var id in map ){
        var data = map[id];
        var ele = cy.getElementById( id );

        ele.data( data );
      }
    });
  }
});

module.exports = corefn;
