<template>
  <div>
    <SkuList v-if="isShowSkuList" :spuItem='spuItem' />

    <div v-else>
      <Category :disabled="!isShowList" />
      <SpuShowList v-if="isShowList" @showUpdateList="showUpdateList" @showSkuList='showSkuList' />
      <SpuUpdateList v-else :item="item" @showList="showList" />
    </div>
  </div>
</template>

<script>
import Category from "@/components/Category";
import SpuShowList from "./spuShowList";
import SpuUpdateList from "./spuUpdateList";
import SkuList from "./skuList";

export default {
  name: "SpuList",
  data() {
    return {
      isShowList: true,
      item: {},
      isShowSkuList: false,
      spuItem:{},
    };
  },
  methods: {
    // SpuShowList中点击编辑按钮时触发，传递参数row
    showUpdateList(row) {
      this.isShowList = false;
      this.item = { ...row };
    },
    //SpuUpdateList组件中点击保存更新spu成功或者点击取消时触发，传递参数category3Id
    showList(category3Id) {
      this.isShowList = true;
      //等SpuShowList组件页面挂载成功后触发change事件重新获取spu分页列表
      this.$nextTick(() => {
        this.$bus.$emit("change", { category3Id });
      });
    },
    showSkuList(row) {
      this.isShowSkuList = true
      this.spuItem = {...row}
    },
  },
  components: {
    Category,
    SpuShowList,
    SpuUpdateList,
    SkuList,
  },
};
</script>
