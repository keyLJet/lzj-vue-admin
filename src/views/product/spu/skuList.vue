<template>
  <el-card>
    <el-form label-width="100px" :model="sku" :rules="rules" ref="skuForm">
      <el-form-item label="SPU名称">
        <span>{{ spu.spuName }}</span>
      </el-form-item>
      <el-form-item label="SKU名称" prop="skuName">
        <el-input placeholder="请输入SKU名称" v-model="sku.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)" prop="price">
        <el-input-number
          v-model="sku.price"
          align="left"
          style="width: 300px"
          placeholder="请输入价格"
          controls-position="right"
          :min="0"
          :max="1000000"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="重量(千克)" prop="weight">
        <el-input-number
          v-model="sku.weight"
          style="width: 300px"
          placeholder="请输入重量"
          controls-position="right"
          :min="0"
          :max="1000000"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="规格描述" prop="skuDesc">
        <el-input
          type="textarea"
          placeholder="请输入规格描述"
          v-model="sku.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性" prop="skuAttrValueList">
        <div
          class="skulist-select-container"
          v-for="(attr, index) in attrList"
          :key="attr.id"
        >
          <el-form-item :label="attr.attrName" style="display: inline-block">
            <el-select
              placeholder="请选择"
              v-model="sku.skuAttrValueList[index]"
              @change="clearValidate('skuAttrValueList')"
            >
              <el-option
                v-for="value in attr.attrValueList"
                :key="value.id"
                :label="value.valueName"
                :value="`${attr.id}-${value.id}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="销售属性" prop="skuSaleAttrValueList">
        <div
          class="skulist-select-container"
          v-for="(sale, index) in spuSaleAttrList"
          :key="sale.id"
        >
          <el-form-item
            style="display: inline-block"
            :label="sale.saleAttrName"
          >
            <el-select
              placeholder="请选择"
              v-model="sku.skuSaleAttrValueList[index]"
              @change="clearValidate('skuSaleAttrValueList')"
            >
              <el-option
                v-for="value in sale.spuSaleAttrValueList"
                :key="value.id"
                :label="value.saleAttrValueName"
                :value="value.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="图片列表" prop="skuImageList">
        <el-table
          ref="multipleTable"
          border
          :data="imageList"
          tooltip-effect="dark"
          style="width: 100%; margin: 20px 0"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" reserve-selection>
          </el-table-column>
          <el-table-column label="图片">
            <template slot-scope="scope"
              ><img
                :src="scope.row.imgUrl"
                :alt="scope.row.imgName"
                style="display: inline-block; width: 100%; height: 200px"
            /></template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row }">
              <el-button
                v-if="!row.isDefault"
                type="primary"
                size="mini"
                @click="setDefault(row.id)"
                >设为默认</el-button
              >
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('showList')">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    spuItem: Object,
  },
  data() {
    return {
      spu: this.spuItem,
      rules: {
        skuName: [
          { required: true, message: "请输入sku名称", trigger: "change" },
        ],
        price: [
          { required: true, message: "请输入sku价格", trigger: "change" },
        ],
        weight: [
          { required: true, message: "请输入sku重量", trigger: "change" },
        ],
        skuDesc: [
          { required: true, message: "请输入sku描述", trigger: "change" },
        ],
        skuAttrValueList: [
          {
            required: true,
            validator: this.skuAttrValueListValidator,
          },
        ],
        skuSaleAttrValueList: [
          { required: true, validator: this.skuSaleAttrValueListValidator },
        ],
        skuImageList: [
          { required: true, validator: this.skuImageListValidator },
        ],
      },
      imageList: [],
      spuSaleAttrList: [], // spu销售属性数据
      attrList: [], // 平台属性数据
      sku: {
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: [],
      }, // sku数据
    };
  },
  computed: {
    ...mapState({
      category: (state) => state.category.category,
    }),
  },
  methods: {
    handleSelectionChange(skuImageList) {
      this.sku.skuImageList = skuImageList;
    },
    // 获取spu图片列表
    async getSpuImageList() {
      const { id } = this.spu;
      const result = await this.$API.spu.getSpuImageList(id);
      if (result.code === 200) {
        this.$message.success("获取spu相关图片成功");
        this.imageList = result.data.map((img) => {
          return {
            ...img,
            isCheck: true,
          };
        });
      } else {
        this.$message.error(result.message);
      }
    },
    // 获取spu销售属性列表
    async getSpuSaleAttrList() {
      const { id } = this.spu;
      const result = await this.$API.spu.getSpuSaleAttrList(id);
      if (result.code === 200) {
        this.$message.success("获取SPU销售属性列表成功");
        this.spuSaleAttrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    // 获取所有平台属性列表
    async getAttrList() {
      const result = await this.$API.attrs.getAttrList(this.category);
      if (result.code === 200) {
        this.$message.success("获取所有平台属性列表成功~");
        // 处理数据
        this.attrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    setDefault(id) {
      this.clearValidate("skuImageList");
      this.imageList = this.imageList.map((img) => {
        return {
          ...img,
          isDefault: img.id === id ? true : false,
        };
      });
      //同时也要修改skuImageList的数据
      this.sku.skuImageList = this.sku.skuImageList.map((img) => {
        return {
          ...img,
          isDefault: img.id === id ? true : false,
        };
      });

    },
    skuAttrValueListValidator(rule, value, callback) {
      const {
        attrList,
        sku: { skuAttrValueList },
      } = this;

      if (
        skuAttrValueList.length !== attrList.length ||
        skuAttrValueList.some((value) => !value)
      ) {
        callback(new Error("请对所有平台属性进行选择~"));
        return;
      }

      callback();
    },
    skuSaleAttrValueListValidator(rule, value, callback) {
      const {
        spuSaleAttrList,
        sku: { skuSaleAttrValueList },
      } = this;

      if (
        skuSaleAttrValueList.length !== spuSaleAttrList.length ||
        skuSaleAttrValueList.some((value) => !value)
      ) {
        callback(new Error("请对所有销售属性进行选择~"));
        return;
      }

      callback();
    },
    skuImageListValidator(rule, value, callback) {
      const {
        sku: { skuImageList },
      } = this;
      if(skuImageList.length ===0 ){
        callback(new Error('请至少选择一张图片'))
        return
      }
      if(! skuImageList.some((img) => img.isDefault) ){
        callback(new Error('请设置一张默认图片'))
        return
      }
      callback()
    },
    clearValidate(prop) {
      this.$refs.skuForm.clearValidate(prop);
    },
    save() {
      this.$refs.skuForm.validate(async(valid) => {
        if (valid) {
          console.log("校验通过！");
          //收集发送请求参数所需数据
          const {category3Id,id:spuId,tmId}=this.spu
          const skuAttrValueList = this.sku.skuAttrValueList.map((item) =>{
            const [attrId,valueId] = item.split('-')
            return {
              attrId,
              valueId
            }
          })

          const skuSaleAttrValueList = this.sku.skuSaleAttrValueList.map(
            (saleAttrValueId) => {
              return {
                saleAttrValueId,
                spuId,
              };
            }
          )

          const skuDefaultImg = this.sku.skuImageList.find((img) => img.isDefault).imgUrl
          //发送请求添加sku信息
          const result = await this.$API.sku.saveSku({
            ...this.sku,
            category3Id,
            spuId,
            tmId,
            skuAttrValueList,
            skuSaleAttrValueList,
            skuDefaultImg
          })
          if (result.code === 200) {
            this.$message.success("添加sku成功！");
            this.$emit("showList");
          } else {
            this.$message.error(result.message);
          }

        }
      });
    },
  },
  mounted() {
    this.getSpuImageList();
    this.getSpuSaleAttrList();
    this.getAttrList();
  },
};
</script>

<style lang="sass" scoped>
>>>.el-input-number .el-input__inner
  text-align: left

.skulist-select-container
  display: inline-block
  width: 30%
  margin-bottom: 10px
</style>
