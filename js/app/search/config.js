/**
 * Created by lomteva.aa on 22.04.2016.
 */
define(function () {
    return {
        sources: [
            {
                id: "Substation",
                aliasClassName:"Подстанция",
                url: "http://vm.igit.spb.ru:6080/arcgis/rest/services/LE/Features/FeatureServer/4",
                fields: ["localName","aliasName"],
                num: 50,
                /**
                 *
                 * @param data
                 * @returns {string}
                 */
                divTemplate: function(data){
                    var className = data.className ;
                    var objectId = data.attributes.OBJECTID;
                    var divId=className+"-"+objectId;
                    var localName = data.attributes.localName === null||""? "наименование не указано": data.attributes.localName;
                    var aliasName = data.attributes.aliasName === null||""? "диспетчерское наименование не указано": data.attributes.aliasName;
                    var description=data.attributes.description === null||""? "нет описания": data.attributes.description;
                    var aliasClassName=this.aliasClassName;
                    return "<div class='search-result' id='"+divId+"' data-id='"+objectId+"'data-className='"+className+"'>" +
                        "<div class='search-result-id' id='id-"+divId+"'>"+aliasClassName+" ID: "+objectId+"</div>" +
                        "<div class='search-result-name' id='name-"+divId+"'><strong>"+localName+" ("+aliasName+")</strong></div>" +
                        "<div id='description-"+divId+"'>"+description+"</div>" +
                        "<div class='links-container' id='links-container-" + divId + "'></div>" +
                      "<div class='docs-container' id='docs-container-" + divId + "'></div></div>";
                },
                links:["map","passport","layout","documents","contacts"]
            },
            {
                id: "PowerLine",
                aliasClassName:"ЛЭП",
                url: "http://vm.igit.spb.ru:6080/arcgis/rest/services/LE/Features/FeatureServer/9",
                fields: ["localName","aliasName"],
                num: 50,
                /**
                 *
                 * @param data
                 * @returns {string}
                 */
                divTemplate: function(data){
                    var className = data.className ;
                    var objectId = data.attributes.OBJECTID;
                    var divId=className+"-"+objectId;
                    var localName = data.attributes.localName === null||""? "наименование не указано": data.attributes.localName;
                    var aliasName = data.attributes.aliasName === null||""? "диспетчерское наименование не указано": data.attributes.aliasName;
                    var description=data.attributes.description === null||""? "нет описания": data.attributes.description;
                    var aliasClassName=this.aliasClassName;
                    return "<div class='search-result' id='"+divId+"' data-id='"+objectId+"'data-className='"+className+"'>" +
                        "<div class='search-result-id' id='id-"+divId+"'>"+aliasClassName+" ID: "+objectId+"</div>" +
                        "<div class='search-result-name' id='name-"+divId+"'><strong>"+localName+" ("+aliasName+")</strong></div>" +
                        "<div id='description-"+divId+"'>"+description+"</div>" +
                        "<div class='links-container' id='links-container-" + divId + "'></div>" +
                      "<div class='docs-container' id='docs-container-" + divId + "'></div></div>";

                },
                links:["map","passport","layout","documents","contacts"]
            },
            {
                id: "ErpPerson",
                aliasClassName:"Сотрудник",
                url: "http://vm.igit.spb.ru:6080/arcgis/rest/services/LE/Features/FeatureServer/30",
                fields: ["lastName","firstName","company","branch","gridArea","gridSector"],
                num: 50,
                /**
                 *
                 * @param data
                 * @returns {string}
                 */
                divTemplate: function(data){
                    var className = data.className ;
                    var objectId = data.attributes.OBJECTID;
                    var divId=className+"-"+objectId;
                    var lastName = data.attributes.lastName === null||""? "(фамилия не указана)": data.attributes.lastName;
                    var firstName = data.attributes.firstName === null||""? "(имя не указано)": data.attributes.firstName;
                    var mName=data.attributes.mName === null||""? "(отчество не указано)": data.attributes.mName;
                    var craft=data.attributes.craft=== null||""? "должность не указана": data.attributes.craft;
                    var company=data.attributes.company=== null||""? "(компания не указана)": data.attributes.company;
                    var branch=data.attributes.branch=== null||""? "(филиал не указан)": data.attributes.branch;
                    var gridArea=data.attributes.gridArea=== null||""? "(сетевой район/служба не указаны)": data.attributes.gridArea;
                    var gridSector=data.attributes.gridSector=== null||""? "(мастерский участок/отдел не указаны)": data.attributes.gridSector;
                    var aliasClassName=this.aliasClassName;
                    var workPlace=company+" "+branch+" "+gridArea+" "+gridSector;
                    return "<div class='search-result' id='"+divId+"' data-id='"+objectId+"'data-className='"+className+"'>" +
                        "<div class='search-result-id' id='id-"+divId+"'>"+aliasClassName+" ID: "+objectId+"</div>" +
                        "<div class='search-result-name' id='name-"+divId+"'><strong>"+lastName+" "+firstName+" "+mName+"</strong></div>" +
                        "<div id='description-"+divId+"'>"+craft+" в "+workPlace+"</div>" +
                        "<div class='links-container' id='links-container-" + divId + "'></div>" +
                      "<div class='docs-container' id='docs-container-" + divId + "'></div></div>";

                },
                links:["documents","contacts"]
            }
        ],
        classes: {
            utils: {
                DocumentIdentifyObjectRole: {
                    url: ""
                },
                Document: {
                    url: ""
                }
            }
        }
    }
});