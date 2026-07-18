export type CompoundCategory =
  "ACID" | "BASE" | "SALT" | "OXIDE" | "ORGANIC" | "GAS_ELEMENT";

export interface CompoundEntry {
  formula: string;
  /** Tên hóa học chính thức */
  name: string;
  /** Tên thường gọi trong đời sống, nếu có (vd. "muối ăn") */
  commonName?: string;
  category: CompoundCategory;
}

export const CATEGORY_LABELS: Record<CompoundCategory, string> = {
  ACID: "Axit",
  BASE: "Bazơ",
  SALT: "Muối",
  OXIDE: "Oxit",
  ORGANIC: "Hữu cơ",
  GAS_ELEMENT: "Đơn chất / khí",
};

export const COMPOUNDS: CompoundEntry[] = [
  // Axit
  {
    formula: "HCl",
    name: "Axit clohidric",
    commonName: "Axit muối",
    category: "ACID",
  },
  { formula: "H2SO4", name: "Axit sunfuric", category: "ACID" },
  { formula: "HNO3", name: "Axit nitric", category: "ACID" },
  { formula: "H3PO4", name: "Axit photphoric", category: "ACID" },
  {
    formula: "CH3COOH",
    name: "Axit axetic",
    commonName: "Giấm ăn (dung dịch loãng)",
    category: "ACID",
  },
  { formula: "H2CO3", name: "Axit cacbonic", category: "ACID" },
  { formula: "H2SO3", name: "Axit sunfurơ", category: "ACID" },
  { formula: "H2S", name: "Axit sunfuhidric (hiđro sunfua)", category: "ACID" },
  { formula: "HBr", name: "Axit bromhidric", category: "ACID" },
  { formula: "HI", name: "Axit iothidric", category: "ACID" },
  { formula: "HF", name: "Axit flohidric", category: "ACID" },
  { formula: "HClO", name: "Axit hipoclorơ", category: "ACID" },
  { formula: "HClO4", name: "Axit pecloric", category: "ACID" },
  {
    formula: "HCOOH",
    name: "Axit fomic",
    commonName: "Axit kiến",
    category: "ACID",
  },
  {
    formula: "H2C2O4",
    name: "Axit oxalic",
    commonName: "Axit chua me",
    category: "ACID",
  },
  {
    formula: "C6H8O7",
    name: "Axit citric",
    commonName: "Axit chanh",
    category: "ACID",
  },

  // Bazơ
  {
    formula: "NaOH",
    name: "Natri hidroxit",
    commonName: "Xút ăn da",
    category: "BASE",
  },
  {
    formula: "KOH",
    name: "Kali hidroxit",
    commonName: "Potat ăn da",
    category: "BASE",
  },
  {
    formula: "Ca(OH)2",
    name: "Canxi hidroxit",
    commonName: "Vôi tôi, nước vôi trong",
    category: "BASE",
  },
  { formula: "Ba(OH)2", name: "Bari hidroxit", category: "BASE" },
  {
    formula: "NH3",
    name: "Amoniac",
    commonName: "Nước amoniac (khi tan trong nước)",
    category: "BASE",
  },
  { formula: "Mg(OH)2", name: "Magie hidroxit", category: "BASE" },
  { formula: "Al(OH)3", name: "Nhôm hidroxit", category: "BASE" },
  { formula: "Fe(OH)2", name: "Sắt(II) hidroxit", category: "BASE" },
  { formula: "Fe(OH)3", name: "Sắt(III) hidroxit", category: "BASE" },
  { formula: "Cu(OH)2", name: "Đồng(II) hidroxit", category: "BASE" },
  { formula: "Zn(OH)2", name: "Kẽm hidroxit", category: "BASE" },
  { formula: "LiOH", name: "Liti hidroxit", category: "BASE" },

  // Muối
  {
    formula: "NaCl",
    name: "Natri clorua",
    commonName: "Muối ăn",
    category: "SALT",
  },
  {
    formula: "CaCO3",
    name: "Canxi cacbonat",
    commonName: "Đá vôi, đá phấn",
    category: "SALT",
  },
  {
    formula: "Na2CO3",
    name: "Natri cacbonat",
    commonName: "Sođa",
    category: "SALT",
  },
  {
    formula: "NaHCO3",
    name: "Natri hidrocacbonat",
    commonName: "Muối nở, baking soda",
    category: "SALT",
  },
  {
    formula: "CaSO4",
    name: "Canxi sunfat",
    commonName: "Thạch cao",
    category: "SALT",
  },
  {
    formula: "CuSO4",
    name: "Đồng(II) sunfat",
    commonName: "Phèn xanh (dạng ngậm nước)",
    category: "SALT",
  },
  { formula: "FeSO4", name: "Sắt(II) sunfat", category: "SALT" },
  { formula: "Fe2(SO4)3", name: "Sắt(III) sunfat", category: "SALT" },
  { formula: "AgNO3", name: "Bạc nitrat", category: "SALT" },
  {
    formula: "KNO3",
    name: "Kali nitrat",
    commonName: "Diêm tiêu",
    category: "SALT",
  },
  { formula: "NaNO3", name: "Natri nitrat", category: "SALT" },
  { formula: "Na2SO4", name: "Natri sunfat", category: "SALT" },
  { formula: "K2SO4", name: "Kali sunfat", category: "SALT" },
  { formula: "CaCl2", name: "Canxi clorua", category: "SALT" },
  { formula: "MgCl2", name: "Magie clorua", category: "SALT" },
  { formula: "AlCl3", name: "Nhôm clorua", category: "SALT" },
  { formula: "FeCl2", name: "Sắt(II) clorua", category: "SALT" },
  { formula: "FeCl3", name: "Sắt(III) clorua", category: "SALT" },
  { formula: "ZnCl2", name: "Kẽm clorua", category: "SALT" },
  { formula: "BaCl2", name: "Bari clorua", category: "SALT" },
  { formula: "BaSO4", name: "Bari sunfat", category: "SALT" },
  { formula: "Na3PO4", name: "Natri photphat", category: "SALT" },
  { formula: "Ca3(PO4)2", name: "Canxi photphat", category: "SALT" },
  {
    formula: "KMnO4",
    name: "Kali pemanganat",
    commonName: "Thuốc tím",
    category: "SALT",
  },
  { formula: "K2Cr2O7", name: "Kali đicromat", category: "SALT" },
  { formula: "Na2SO3", name: "Natri sunfit", category: "SALT" },
  {
    formula: "CaC2",
    name: "Canxi cacbua",
    commonName: "Đất đèn",
    category: "SALT",
  },
  {
    formula: "NH4Cl",
    name: "Amoni clorua",
    commonName: "Muối lạnh",
    category: "SALT",
  },
  { formula: "(NH4)2SO4", name: "Amoni sunfat", category: "SALT" },
  { formula: "NH4NO3", name: "Amoni nitrat", category: "SALT" },
  { formula: "K2CO3", name: "Kali cacbonat", category: "SALT" },
  {
    formula: "MgSO4",
    name: "Magie sunfat",
    commonName: "Muối Epsom",
    category: "SALT",
  },
  { formula: "AgCl", name: "Bạc clorua", category: "SALT" },
  {
    formula: "NaClO",
    name: "Natri hipoclorit",
    commonName: "Nước Javen (thành phần chính)",
    category: "SALT",
  },
  {
    formula: "Ca(ClO)2",
    name: "Canxi hipoclorit",
    commonName: "Clorua vôi",
    category: "SALT",
  },
  {
    formula: "CaOCl2",
    name: "Canxi oxiclorua",
    commonName: "Clorua vôi (dạng bột)",
    category: "SALT",
  },
  { formula: "KI", name: "Kali iotua", category: "SALT" },
  { formula: "KBr", name: "Kali bromua", category: "SALT" },
  { formula: "NaBr", name: "Natri bromua", category: "SALT" },
  { formula: "Al2(SO4)3", name: "Nhôm sunfat", category: "SALT" },
  {
    formula: "KAl(SO4)2",
    name: "Kali nhôm sunfat",
    commonName: "Phèn chua (dạng khan)",
    category: "SALT",
  },
  { formula: "Cu(NO3)2", name: "Đồng(II) nitrat", category: "SALT" },
  { formula: "Zn(NO3)2", name: "Kẽm nitrat", category: "SALT" },
  { formula: "Pb(NO3)2", name: "Chì(II) nitrat", category: "SALT" },
  { formula: "MnCl2", name: "Mangan(II) clorua", category: "SALT" },

  // Oxit
  { formula: "H2O", name: "Nước (đihidro oxit)", category: "OXIDE" },
  {
    formula: "CO2",
    name: "Cacbon đioxit",
    commonName: "Khí cacbonic",
    category: "OXIDE",
  },
  { formula: "CO", name: "Cacbon monoxit", category: "OXIDE" },
  {
    formula: "SO2",
    name: "Lưu huỳnh đioxit",
    commonName: "Khí sunfurơ",
    category: "OXIDE",
  },
  { formula: "SO3", name: "Lưu huỳnh trioxit", category: "OXIDE" },
  { formula: "NO", name: "Nitơ monoxit", category: "OXIDE" },
  { formula: "NO2", name: "Nitơ đioxit", category: "OXIDE" },
  { formula: "N2O5", name: "Đinitơ pentaoxit", category: "OXIDE" },
  {
    formula: "N2O",
    name: "Đinitơ oxit",
    commonName: "Khí cười",
    category: "OXIDE",
  },
  { formula: "P2O5", name: "Điphotpho pentaoxit", category: "OXIDE" },
  {
    formula: "SiO2",
    name: "Silic đioxit",
    commonName: "Cát, thạch anh",
    category: "OXIDE",
  },
  {
    formula: "Fe2O3",
    name: "Sắt(III) oxit",
    commonName: "Gỉ sắt (thành phần chính)",
    category: "OXIDE",
  },
  { formula: "Fe3O4", name: "Sắt từ oxit (oxit sắt từ)", category: "OXIDE" },
  { formula: "FeO", name: "Sắt(II) oxit", category: "OXIDE" },
  { formula: "CuO", name: "Đồng(II) oxit", category: "OXIDE" },
  { formula: "Cu2O", name: "Đồng(I) oxit", category: "OXIDE" },
  { formula: "ZnO", name: "Kẽm oxit", category: "OXIDE" },
  { formula: "Al2O3", name: "Nhôm oxit", category: "OXIDE" },
  {
    formula: "CaO",
    name: "Canxi oxit",
    commonName: "Vôi sống",
    category: "OXIDE",
  },
  { formula: "MgO", name: "Magie oxit", category: "OXIDE" },
  { formula: "Na2O", name: "Natri oxit", category: "OXIDE" },
  { formula: "K2O", name: "Kali oxit", category: "OXIDE" },
  { formula: "MnO2", name: "Mangan đioxit", category: "OXIDE" },
  { formula: "BaO", name: "Bari oxit", category: "OXIDE" },
  { formula: "PbO2", name: "Chì đioxit", category: "OXIDE" },
  { formula: "Cr2O3", name: "Crom(III) oxit", category: "OXIDE" },
  {
    formula: "H2O2",
    name: "Hidro peoxit",
    commonName: "Oxy già",
    category: "OXIDE",
  },

  // Hữu cơ
  { formula: "CH4", name: "Metan", category: "ORGANIC" },
  { formula: "C2H6", name: "Etan", category: "ORGANIC" },
  { formula: "C3H8", name: "Propan", category: "ORGANIC" },
  { formula: "C4H10", name: "Butan", category: "ORGANIC" },
  { formula: "C2H4", name: "Etilen (eten)", category: "ORGANIC" },
  { formula: "C3H6", name: "Propilen (propen)", category: "ORGANIC" },
  { formula: "C2H2", name: "Axetilen (etin)", category: "ORGANIC" },
  { formula: "C6H6", name: "Benzen", category: "ORGANIC" },
  { formula: "C7H8", name: "Toluen", category: "ORGANIC" },
  {
    formula: "CH3OH",
    name: "Metanol",
    commonName: "Rượu metylic (cồn công nghiệp)",
    category: "ORGANIC",
  },
  {
    formula: "C2H5OH",
    name: "Etanol",
    commonName: "Rượu etylic, cồn",
    category: "ORGANIC",
  },
  { formula: "C3H7OH", name: "Propanol", category: "ORGANIC" },
  { formula: "C2H4(OH)2", name: "Etylen glicol", category: "ORGANIC" },
  {
    formula: "C3H5(OH)3",
    name: "Glixerol",
    commonName: "Glixerin",
    category: "ORGANIC",
  },
  {
    formula: "HCHO",
    name: "Metanal",
    commonName: "Fomandehit",
    category: "ORGANIC",
  },
  {
    formula: "CH3CHO",
    name: "Etanal",
    commonName: "Axetandehit",
    category: "ORGANIC",
  },
  {
    formula: "CH3COCH3",
    name: "Propan-2-on",
    commonName: "Axeton",
    category: "ORGANIC",
  },
  { formula: "CH3COOC2H5", name: "Etyl axetat", category: "ORGANIC" },
  { formula: "C6H12O6", name: "Glucozơ", category: "ORGANIC" },
  {
    formula: "C12H22O11",
    name: "Saccarozơ",
    commonName: "Đường mía",
    category: "ORGANIC",
  },
  { formula: "C6H5OH", name: "Phenol", category: "ORGANIC" },
  { formula: "C6H5NH2", name: "Anilin", category: "ORGANIC" },
  { formula: "CH3NH2", name: "Metylamin", category: "ORGANIC" },
  { formula: "C6H5COOH", name: "Axit benzoic", category: "ORGANIC" },
  { formula: "C17H35COOH", name: "Axit stearic", category: "ORGANIC" },

  // Đơn chất / khí thường gặp
  { formula: "H2", name: "Khí hiđro", category: "GAS_ELEMENT" },
  { formula: "O2", name: "Khí oxi", category: "GAS_ELEMENT" },
  { formula: "N2", name: "Khí nitơ", category: "GAS_ELEMENT" },
  { formula: "Cl2", name: "Khí clo", category: "GAS_ELEMENT" },
  { formula: "F2", name: "Khí flo", category: "GAS_ELEMENT" },
  { formula: "Br2", name: "Brom (lỏng)", category: "GAS_ELEMENT" },
  { formula: "I2", name: "Iot (rắn)", category: "GAS_ELEMENT" },
  { formula: "S", name: "Lưu huỳnh", category: "GAS_ELEMENT" },
  { formula: "P", name: "Photpho", category: "GAS_ELEMENT" },
  {
    formula: "C",
    name: "Cacbon (than, kim cương, graphit)",
    category: "GAS_ELEMENT",
  },
  { formula: "Si", name: "Silic", category: "GAS_ELEMENT" },
  { formula: "Fe", name: "Sắt", category: "GAS_ELEMENT" },
  { formula: "Cu", name: "Đồng", category: "GAS_ELEMENT" },
  { formula: "Zn", name: "Kẽm", category: "GAS_ELEMENT" },
  { formula: "Al", name: "Nhôm", category: "GAS_ELEMENT" },
  { formula: "Ag", name: "Bạc", category: "GAS_ELEMENT" },
  { formula: "Au", name: "Vàng", category: "GAS_ELEMENT" },
  { formula: "Na", name: "Natri", category: "GAS_ELEMENT" },
  { formula: "K", name: "Kali", category: "GAS_ELEMENT" },
  { formula: "Ca", name: "Canxi", category: "GAS_ELEMENT" },
  { formula: "Mg", name: "Magie", category: "GAS_ELEMENT" },
  { formula: "Hg", name: "Thủy ngân", category: "GAS_ELEMENT" },
  { formula: "Pb", name: "Chì", category: "GAS_ELEMENT" },
  { formula: "Sn", name: "Thiếc", category: "GAS_ELEMENT" },
];

/** Tìm theo công thức (khớp chính xác, không phân biệt hoa thường) hoặc theo tên/tên thường gọi (khớp một phần). */
export function searchCompounds(query: string): CompoundEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exactFormula = COMPOUNDS.filter((c) => c.formula.toLowerCase() === q);
  if (exactFormula.length > 0) return exactFormula;

  return COMPOUNDS.filter(
    (c) =>
      c.formula.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.commonName?.toLowerCase().includes(q),
  );
}
