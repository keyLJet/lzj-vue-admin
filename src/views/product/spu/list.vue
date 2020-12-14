<template>
<div>
  <Category />
  <SpuShowList v-show="isShowList" @showUpdateList='showUpdateList' />
  <SpuUpdateList v-show="!isShowList" :item='item' />

</div>
</template>

<script>
import Category from '@/components/Category'
import SpuShowList from './spuShowList'
import SpuUpdateList from './spuUpdateList'

export default {
  name: 'SpuList',
  data() {
    return {
      isShowList:true,
      item:{},
    }
  },
  methods:{
    // SpuShowList中点击编辑按钮时触发，传递参数row
    showUpdateList(row){
      this.isShowList = false
      this.item = {...row}
    },
  },
  components: {
    Category,
    SpuShowList,
    SpuUpdateList,
   },
}
</script>
