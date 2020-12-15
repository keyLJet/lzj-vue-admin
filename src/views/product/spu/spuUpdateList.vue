<template>
  <el-card style="margin-top: 20px">
    <el-form label-width="80px" :model="spu" :rules="rules" ref="spuForm">
      <el-form-item label="SPU名称" prop="spuName">
        <el-input placeholder="请输入SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌" prop="tmId">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            v-for="tm in trademarkList"
            :label="tm.tmName"
            :value="tm.id"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述" prop="description">
        <el-input
          type="textarea"
          placeholder="请输入SPU描述"
          v-model="spu.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片" prop="imageList">
        <el-upload
          class="avatar-uploader"
          list-type="picture-card"
          :file-list="formatImageList"
          :action="`${$BASE_API}/admin/product/fileUpload`"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          accept="image/*"
        >
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <span>只能上传jpg/png文件，且不超过50kb</span>
      </el-form-item>
      <el-form-item label="销售属性" prop="sale">
        <el-select
          :placeholder="`还剩${filterSaleAttrList.length}个未选择`"
          v-model="spu.sale"
        >
          <el-option
            v-for="sale in filterSaleAttrList"
            :label="sale.name"
            :value="`${sale.id}-${sale.name}`"
            :key="sale.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!spu.sale"
          @click="addSpuSaleAttr"
          >添加销售属性</el-button
        >
        <el-table
          :data="spuSaleAttrList"
          border
          style="width: 100%; margin: 20px 0"
        >
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名称" width="150">
          </el-table-column>

          <el-table-column label="属性值列表">
            <template v-slot="{ row }">
              <el-tag
                @close="delTag(ind, row)"
                closable
                style="margin-right: 5px"
                v-for="(attrVal,ind) in row.spuSaleAttrValueList"
                :key="attrVal.id"
                >{{ attrVal.saleAttrValueName }}</el-tag
              >
              <el-input
                v-if="row.edit"
                size="mini"
                style="width: 100px"
                @blur="editCompleted(row)"
                @keyup.enter.native="editCompleted(row)"
                autofocus
                ref="input"
                v-model="saleAttrValueText"
              ></el-input>
              <el-button
                v-else
                icon="el-icon-plus"
                size="mini"
                @click="edit(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template v-slot="{ row, $index }">
              <el-popconfirm
                @onConfirm="delSpuSaleAttr($index)"
                :title="`确定删除 ${row.saleAttrName} 吗？`"
                ><el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></el-button
              ></el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('showList',spu.category3Id)">取消</el-button>
      </el-form-item>
    </el-form>

    <el-dialog :visible.sync="visible">
      <img width="100%" :src="previewImgUrl" alt="img" />
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  name: "SpuUpdateList",
  props: {
    item: Object,
  },
  data() {
    return {
      spu: this.item,
      trademarkList: [], // 所有品牌数据
      imageList: [], // 所有图片列表
      previewImgUrl: "", // 图片地址
      visible: false, // 图片对话框显示&隐藏
      saleAttrList: [], // 所有销售属性列表
      spuSaleAttrList: [], // 当前SPU销售属性列表
      saleAttrValueText: "",
      //校验规则
      rules: {
        spuName: [{ required: true, message: "请输入spu名称" }],
        tmId: [{ required: true, message: "请选择品牌" }],
        description: [{ required: true, message: "请输入SPU描述" }],
        imageList: [{ validator: this.imageListValidator, required: true }],
        sale: [{ validator: this.saleValidator, required: true }],
      },
    };
  },
  computed: {
    filterSaleAttrList() {
      return this.saleAttrList.filter((sale) => {
        return !this.spuSaleAttrList.find(
          (supSale) => supSale.baseSaleAttrId === sale.id
        );
      });
    },
    //处理图片数据字段名，为了在element-ui中使用数据
    formatImageList() {
      return this.imageList.map((img) => {
        return {
          name: img.imgName,
          url: img.imgUrl,
          uid: img.uid || img.id,
        };
      });
    },
  },
  methods: {
    // 获取所有品牌数据
    async getTrademarkList() {
      const result = await this.$API.spu.getTrademarkList();
      if (result.code === 200) {
        this.$message.success("获取所有品牌成功~");
        this.trademarkList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    //获取当前spu所有图片数据
    async getSpuImageList() {
      const { id } = this.spu;
      // console.log(id);
      const result = await this.$API.spu.getSpuImageList(id);
      // console.log(result.data);
      if (result.code === 200) {
        this.$message.success("获取当前SPU所有图片成功");
        this.imageList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    // 获取所有销售属性列表
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleAttrList();
      if (result.code === 200) {
        this.$message.success("获取所有销售属性列表成功~");
        this.saleAttrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    // 获取当前SPU销售属性列表
    async getSpuSaleAttrList() {
      const { id } = this.spu;
      const result = await this.$API.spu.getSpuSaleAttrList(id);
      if (result.code === 200) {
        this.$message.success("获取当前SPU销售属性列表成功~");
        // 处理数据
        this.spuSaleAttrList = result.data;
      } else {
        this.$message.error(result.message);
      }
    },
    //处理图片删除的事件回调
    handleRemove(file, fileList) {
      //参数打印查看
      // console.log(file,fileList)
      this.imageList = this.imageList.filter((img) => img.imgUrl !== file.url);
    },
    //处理图片预览的事件回调
    handlePictureCardPreview(file) {
      //参数打印查看
      // console.log(file)
      this.previewImgUrl = file.url;
      this.visible = true;
    },
    // 上次图片之前触发的回调
    beforeAvatarUpload(file) {
      // console.log(file);
      const imgTypes = ["image/jpg", "image/png", "image/jpeg"];
      // 检测文件类型
      const isValidType = imgTypes.indexOf(file.type) > -1;
      // 检测文件大小
      const isLt = file.size / 1024 < 50;

      if (!isValidType) {
        this.$message.error("上传品牌LOGO只能是 JPG 或 PNG 格式!");
      }
      if (!isLt) {
        this.$message.error("上传品牌LOGO大小不能超过 50 kb!");
      }
      // 返回值为true，代表可以上传
      return isValidType && isLt;
    },
    //上传图片成功的回调
    handleAvatarSuccess(res, file) {
      this.imageList.push({
        imgName: file.name,
        imgUrl: res.data,
        spuId: this.spu.id,
        uid: file.uid,
      });
    },
    //添加spu销售属性
    addSpuSaleAttr() {
      const { sale, id } = this.spu;
      const [baseSaleAttrId, saleAttrName] = sale.split("-");
      this.spuSaleAttrList.push({
        baseSaleAttrId: +baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
        spuId: id,
      });
      this.spu.sale = "";
    },
    edit(row) {
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    //添加销售属性值
    editCompleted(row) {
      if (this.saleAttrValueText) {
        row.spuSaleAttrValueList.push({
          baseSaleAttrId: row.baseSaleAttrId,
          saleAttrName: row.saleAttrName,
          saleAttrValueName: this.saleAttrValueText,
          spuId: row.spuId,
        });
        //清空输入框内容
        this.saleAttrValueText = "";
      }

      row.edit = false;
    },
    //点击x按钮删除单个销售属性
    delTag(index, row) {
      console.log(index, row);
      row.spuSaleAttrValueList.splice(index,1)
    },
    //点击垃圾桶图标删除整个属性
    delSpuSaleAttr(index) {
      this.spuSaleAttrList.splice(index, 1);
    },
    //自定义图片列表校验规则
    imageListValidator(rule, value, callback) {
      if (this.imageList.length > 0) {
        // 校验通过
        callback();
        return;
      }
      // 校验失败
      callback(new Error("请至少上传一张图片"));
    },
    //自定义销售属性校验规则
    saleValidator(rule, value, callback) {
      // 判断至少选择一个销售属性
      if (this.spuSaleAttrList.length === 0) {
        callback(new Error("请至少选择一个销售属性~"));
        return;
      }
      // 判断销售属性中至少添加一个销售属性值
      const isNotOk = this.spuSaleAttrList.some(
        (sale) => sale.spuSaleAttrValueList.length === 0
      );

      if (isNotOk) {
        callback(new Error("该销售属性应至少添加一个销售属性值, 请添加"));
        return;
      }
      callback();
    },
    //点击保存，发送请求更新spu信息
    save() {
      //先进行校验
      this.$refs.spuForm.validate(async(valid) => {
        if (valid) {
          console.log("校验通过");
          //收集发送请求所需数据
          const spu = {
            ...this.spu,
            spuImageList:this.imageList,
            spuSaleAttrList:this.spuSaleAttrList
          }
          //发送请求
          const result = await this.$API.spu.updateSpu(spu)
          if(result.code === 200){
            //触发自定义事件showList，切回spuShowList页面
            this.$emit('showList',this.spu.category3Id)

            this.$message.success('更新spu信息成功')
          }else{
            this.$message.error(result.message)
          }
        }
      });
    },
  },
  mounted() {
    this.getTrademarkList();
    this.getSpuImageList();
    this.getSaleAttrList();
    this.getSpuSaleAttrList();
  },
};
</script>

<style>
</style>
