var plateLayOutWidget = plateLayOutWidget || {};

(function($, fabric) {

  plateLayOutWidget.addTabData = function() {

    return {

      requiredFields: [],

      _addTabData: function() {
        // Here we may need more changes because attributes format likely to change
        var tabData = this.options.attributes.tabs;
        var that = this;
        tabData.forEach(function (tab, tabPointer) {
          if (tab["fields"]) {
            var fieldArray = [];
            var fieldArrayIndex = 0;
            // Now we look for fields in the json
            for (field in tab["fields"]) {
              if (tab["fields"][field].required) {
                console.log("its required", tab["fields"][field].id);
                that.requiredFields.push(tab["fields"][field].id);
              }
              var data = tab["fields"][field];
              var input = that._createField(data);

              if (data.id && data.type) {
                that.allWellData[data.id] = (data.type == "boolean") ? "NULL" : "";
              } else {
                console.log("Plz check the format of attributes provided");
              }
              // we save type so that it can be used when we update data on selecting a tile
              $(input).data("type", data.type);
              // We save the caption so that we can use it for bottom table.
              $(input).data("caption", field);
              // Adding data to the main array so that programatically we can access later
              fieldArray[fieldArrayIndex++] = that._createDefaultFieldForTabs();
              $(fieldArray[fieldArrayIndex - 1]).find(".plate-setup-tab-name").html(data.name);
              $(that.allDataTabs[tabPointer]).append(fieldArray[fieldArrayIndex - 1]);
              // now we are adding the field which was collected in the switch case.
              $(fieldArray[fieldArrayIndex - 1]).find(".plate-setup-tab-field-container").html(input);
              // Adding checkbox
              var checkBoxImage = that._addCheckBox(fieldArray, fieldArrayIndex, data);
              // Here we add the checkImage reference to input so now Input knows which is its checkbox..!!
              $(input).data("checkBox", checkBoxImage);
              that._addTabFieldEventHandlers(fieldArray, fieldArrayIndex, data, input);
            }

            that.allDataTabs[tabPointer]["fields"] = fieldArray;
          } else {
            console.log("unknown format in field initialization");
          }
        });
      },

      _createField: function(data) {

        switch (data.type) {
          case "text":
            return this._createTextField(data);
            break;

          case "numeric":
            return this._createNumericField(data);
            break;

          case "select":
            return this._createSelectField(data);
            break;

          case "multiselect":
            return this._createMultiSelectField(data);
            break;

          case "boolean":
            return this._createBooleanField(data);
            break;
        }
      },

      _addTabFieldEventHandlers: function(fieldArray, fieldArrayIndex, data, input) {

        var that = this;
        switch (data.type) {
          case "select":
          case "multiselect":
            $("#" + data.id).select2({
              allowClear: true
            });

            $("#" + data.id).on("change", function(e, generated) {
              // we check if this event is user generated event or system generated , automatic is system generated
              if (generated != "Automatic") {
                that._addData(e);
              }
            });
            break

          case "numeric":
            // Adding prevention for non numeric keys, its basic. need to improve.
            // We use keyup and keydown combination to get only numbers saved in the object
            $(input).keydown(function(evt) {
              var charCode = (evt.which) ? evt.which : evt.keyCode;
              if (charCode != 190 && charCode != 8 && charCode != 0 && (charCode < 48 || charCode > 57)) {
                return false;
              }
            });

            $(input).keyup(function(evt) {
              var charCode = (evt.which) ? evt.which : evt.keyCode;
              if (!(charCode != 190 && charCode != 8 && charCode != 0 && (charCode < 48 || charCode > 57))) {
                that._addData(evt);
              }
            });
            // Now add the label which shows unit.
            var unitDropdownField = this._addUnitDataField(fieldArray, fieldArrayIndex, data);
            fieldArray[fieldArrayIndex - 1].unit = unitDropdownField;
            break;

          case "boolean":
            $("#" + data.id).select2({
              allowClear: true,
              minimumResultsForSearch: -1
            });

            $("#" + data.id).on("change", function(evt, generated) {
              if (generated != "Automatic") {
                that._addData(evt);
              }
            });
            break;

          case "text":
            // we use keyup instead of blur. Blur fires event but canvas fire event even faster
            // so most likely our targeted tile changed, and value added to wrong tile.


            $("#" + data.id).keyup(function(evt) {
              evt.preventDefault();
              //console.log("Cool", evt);
              if ((evt.keyCode == 90 && evt.ctrlKey) || (evt.keyCode == 89 && evt.ctrlKey)) {
                // Leaving it blank so that other event handler takes control.
              } else if (evt.which != 17) {
                that._addData(evt);
              }
            });
            break;
        }
      },

    };
  }
})(jQuery, fabric);