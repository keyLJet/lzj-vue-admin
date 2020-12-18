import request from "@/utils/request";

const api_name = "/admin/product";

export default {
  // 保存sku信息
  saveSku(sku) {
    return request({
      url: `${api_name}/saveSkuInfo`,
      method: "POST",
      data: sku
    });
  }
};
