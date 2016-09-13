/**
 * Created by udaltsov on 12.11.15.
 */
"use strict";

define(function () {
  return {
    PowerLine: {
      default: {
        geometry: null,
        attributes: {
          localName: 'ЛЭП',
          aliasName: 'ЛЭП',
          assetUsage: "на балансе",
          status: "Эксплуатация",
          company: "ПАО «Ленэнерго»",
          branch: "Пригородные электрические сети"
        }
      }
    },
    Substation: {
      default: {
        attributes: {
          localName: "ТП",
          aliasName: "ТП",
          assetType: "центр распределения",
          assetUsage: "на балансе",
          status: "Эксплуатация",
          substationView: "Трансформаторная подстанция",
          company: "ПАО «Ленэнерго»",
          branch: "Пригородные электрические сети"
        },
        geometry: null
      },
      defaultType1: {
        attributes: {
          localName: "ТП",
          aliasName: "ТП",
          assetType: "центр распределения",
          assetUsage: "на балансе",
          status: "Эксплуатация",
          company: "ПАО «Ленэнерго»",
          branch: "Пригородные электрические сети",
          substationView: "Трансформаторная подстанция"
        },
        geometry: null
      },
      technicalConnection: {
        Id: null,
        Name: null,
        Class: null,
        Power: null,
        Address: null,
        Status: null,
        Voltage: null,
        Renovation: null,
        Xcoord: null,
        Ycoord: null,
        Link: null,
        ZoneId: null
      }
    },
    VoltageLevel: {
      default: {
        geometry: null,
        attributes: {
          localName: 'РУ-10кВ',
          aliasName: 'РУ-10кВ',
          assetType: "распределительное устройство",
          nominalVoltage: 10,
          lowVoltageLimit: 10,
          highVoltageLimit: 15
        }
      },
      U10: {
        geometry: null,
        attributes: {
          localName: 'РУ-10кВ',
          aliasName: 'РУ-10кВ',
          assetType: "распределительное устройство",
          nominalVoltage: 10,
          lowVoltageLimit: 10,
          highVoltageLimit: 10
        }
      },
      U04: {
        geometry: null,
        attributes: {
          localName: 'РУ-0.4кВ',
          aliasName: 'РУ-0.4кВ',
          assetType: "распределительное устройство",
          nominalVoltage: 0.4,
          lowVoltageLimit: 0.4,
          highVoltageLimit: 1
        }
      },
      U110: {
        geometry: null,
        attributes: {
          localName: 'РУ-110кВ',
          aliasName: 'РУ-110кВ',
          assetType: "распределительное устройство",
          nominalVoltage: 110,
          lowVoltageLimit: 110,
          highVoltageLimit: 110
        }
      },
      U04CustomerErpPerson: {
        geometry: null,
        attributes: {
          localName: 'ГРЩ-0.4кВ',
          aliasName: 'ГРЩ-0.4кВ',
          assetType: "ГРЩ",
          nominalVoltage: 0.4,
          lowVoltageLimit: 0.22,
          highVoltageLimit: 1
        }
      },
      U04CustomerOrganisation: {
        geometry: null,
        attributes: {
          localName: 'ГРЩ-0.4кВ',
          aliasName: 'ГРЩ-0.4кВ',
          assetType: "ГРЩ",
          nominalVoltage: 0.4,
          lowVoltageLimit: 0.22,
          highVoltageLimit: 1
        }
      }
    },
    PowerTransformer: {
      default: {
        localName: 'Т-1',
        aliasName: 'Т-1',
        assetType: 'трансформатор силовой',
        nominalVoltage: 10
      }
    },
    SubstationMeasurementControl: {
      default: {
        powerReserve1N105: 0,
        powerReserve1N130: 0,
        loadForecastClaims: 0,
        loadForecastContracts: 0,
        reserveForecast1N105bi: 0,
        reserveForecast1N130bi: 0,
        reserveForecast1N105ai: 0,
        reserveForecast1N130ai: 0
      }
    },
    PowerTransformerMeasurementControl: {
      default: {
        loadModeNormal: 0,
        loadMode1N105: 0,
        loadMode1N130: 0
      }
    },
    ErpAddress: {
      default: {
        generalAddress: null
      }
    },
    Structure: {
      default: {
        localName: '',
        aliasName: '',
        assetType: 'промежуточная (П)',
        towerConstruction: "Одностоечная",
        material: "Железобетонная"
      },
      defaultType1: {
        geometry: null,
        attributes: {
          localName: '',
          aliasName: '',
          assetType: 'промежуточная (П)',
          towerConstruction: "Одностоечная",
          material: "Железобетонная",
          assetUsage: "на балансе"
        }
      },
      "промежуточная (П)": {
        geometry: null,
        attributes: {
          localName: '',
          aliasName: '',
          assetType: 'промежуточная (П)',
          towerConstruction: "Одностоечная",
          material: "Железобетонная",
          assetUsage: "на балансе"
        }
      },
      "анкерная (А)": {
        geometry: null,
        attributes: {
          localName: '',
          aliasName: '',
          assetType: 'анкерная (А)',
          towerConstruction: "3-х стоечная",
          material: "Железобетонная",
          assetUsage: "на балансе"
        }
      }
    },
    Switch: {
      defaultType1: {
        geometry: null,
        attributes: {
          localName: 'ППр-1',
          aliasName: '',
          assetType: 'разъединитель'
        }
      }
    },
    EquipmentContainer: {
      default: {
        geometry: null,
        attributes: {
          parentMRID: null,
          chieldMRID: null,
          parentClassName: null,
          chieldClassName: null
        }
      },
      PowerLine_ACLineSegment: {
        geometry: null,
        attributes: {
          parentMRID: null,
          chieldMRID: null,
          parentClassName: 'PowerLine',
          chieldClassName: 'ACLineSegment'
        }
      }
    },
    ConnectivityNode: {
      default: {
        geometry: null,
        attributes: {
          parentMRID: null,
          chieldMRID: null,
          parentClassName: null,
          chieldClassName: null
        }
      },
      default1: {
        geometry: null,
        attributes: {
          parentMRID: null,
          chieldMRID: null,
          parentClassName: null,
          chieldClassName: null,
          localName: "terminal1"
        }
      },
      default2: {
        geometry: null,
        attributes: {
          parentMRID: null,
          chieldMRID: null,
          parentClassName: null,
          chieldClassName: null,
          localName: "terminal2"
        }
      }
    },
    Account: {
      default: {
        geometry: null,
        attributes: {
          userName: "username.aa",
          password: "12345",
          userStatus: "",
          userRole: "редактор",
          userGroup: "ПрЭС",
          email: "vasya@nwenergo.com"
        }
      }
    },
    ACLineSegment: new Object({
      default: {
        geometry: null,
        attributes: {
          localName: "сегмент переменного тока",
          aliasName: "сегмент переменного тока",
          assetType: "воздушный сегмент"
        }
      }
    }),
    Session: {
      default: {
        geometry: null,
        attributes: {
          userName: "",
          sessionStatus: "",
          sessionTimeStart: 0
        }
      }
    },
    ErpPerson: {
      default: {
        geometry: null,
        attributes: {
          userName: "",
          sessionStatus: "",
          sessionTimeStart: 0
        }
      }
    },
    Document: {
      default: {
        geometry: null,
        attributes: {
          name: "",
          pathName: "",
          description: "",
          docStatus: "",
          docTitle: "",
          docType: "",
          subject: ""
        }
      }
    },
    Message: {
      default: {
        geometry: null,
        attributes: {
          name: "",
          localName: "",
          aliasName: "",
          pathName: "",
          messageText: "",
          comments: "",
          createdDateTime: null,
          messageTitle: "Сообщение САЦ",
          messageType: "",
          subject: ""
        }
      }
    },
    Project: {
      default: {
        geometry: null,
        attributes: {
          name: "",
          localName: "",
          aliasName: "",
          pathName: "",
          docType: "технические условия"
        }
      }
    }
  };
});

//# sourceMappingURL=generators-compiled.js.map