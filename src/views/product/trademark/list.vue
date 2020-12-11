<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="visible = true"
      >添加</el-button
    >
    <!-- 主体表格 -->
    <el-table :data="trademarkList" border style="width: 100%; margin: 20px 0">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
      <el-table-column label="品牌LOGO" height="250">
        <template slot-scope="scope">
          <img class="trademark-img" :src="scope.row.logoUrl" alt="logo" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template>
          <el-button type="warning" icon="el-icon-edit">修改</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器element-ui -->
    <el-pagination
      class="trademark-pagination"
      @size-change="getPageList(page, $event)"
      @current-change="getPageList($event, limit)"
      :page-sizes="[3, 6, 9]"
      :page-size.sync="limit"
      layout="prev, pager, next, jumper, sizes, total"
      :total="total"
      :current-page="page"
    >
    </el-pagination>
    <!-- 对话框element-ui -->
    <el-dialog title="添加品牌" :visible.sync="visible" width="50%">
      <el-form
        :model="trademarkForm"
        :rules="rules"
        ref="trademarkForm"
        label-width="100px"
      >
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="trademarkForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademarkForm.logoUrl"
              :src="trademarkForm.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span>只能上传jpg/png文件，且不超过50kb</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('trademarkForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TrademarkList",
  data() {
    return {
      trademarkList: [],
      total: 0,
      page: 1,
      limit: 3,
      visible: false,
      trademarkForm: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          {
            required: true,
            $message: "请输入品牌名称",
            trigger: blur,
          },
        ],
        logoUrl: [
          {
            required: true,
            $message: "请上传品牌logo图片",
          },
        ],
      },
    };
  },
  methods: {
    //获取品牌列表
    async getPageList(page, limit) {
      const result = await this.$API.trademark.getPageList(page, limit);
      if (result.code === 200) {
        // this.$message.success("获取品牌分页列表成功");
        this.limit = result.data.size; // 代表每页显示的条数
        this.page = result.data.current; // 代表当前页码
        this.trademarkList = result.data.records;
        this.total = result.data.total; // 总数
      } else {
        this.$message.error("获取品牌分页列表失败");
      }
    },
    //上传logo图片前触发校验，返回值为true才能上传成功
    beforeAvatarUpload(file) {
      const imgTypes = ["image/jpg", "image/jpeg", "image/png"];
      const isValidType = imgTypes.indexOf(file.type) > -1;
      const isLimited50kb = file.size / 1024 < 50;
      if (!isValidType) {
        this.$message.error("上传的品牌logo图片格式必须为jpg、jpeg或png！");
      }
      if (!isLimited50kb) {
        this.$message.error("上传的品牌logo图片大小必须小于50kb！");
      }
      return imgTypes && isLimited50kb;
    },
    //上传图片成功后触发，将图片url地址赋值给响应式数据从而更新页面
    handleAvatarSuccess(res) {
      // console.log(res);
      this.trademarkForm.logoUrl = res.data;
    },
    //提交表单
    submitForm(form){
      // console.log(form)
      //校验表单通过才发送请求给服务器添加品牌
      this.$refs[form].validate(async (valid) =>{
        if(valid) {
          console.log(this.trademarkForm);
          const result = await this.$API.trademark.addTrademark(this.trademarkForm)
          if(result.code === 200){
            this.$message.success('添加品牌数据成功！')
            //隐藏对话框
            this.visible = false
            //重新请求品牌列表数据
            this.getPageList(this.page,this.limit)
          }else{
            this.$message.error(result.message)
          }
        }
      })
    },
  },
  mounted() {
    this.getPageList(this.page, this.limit);
  },
};
</script>

<style lang="sass" scoped>
.trademark-img
  width: 150px

.trademark-pagination
  text-align: right

>>>.el-pagination__sizes
  margin-left: 250px

>>>.avatar-uploader .el-upload
  border: 1px dashed #d9d9d9
  border-radius: 6px
  cursor: pointer
  position: relative
  overflow: hidden
  &:hover
    border-color: #409EFF

>>>.avatar-uploader-icon
  font-size: 28px
  color: #8c939d
  width: 178px
  height: 178px
  line-height: 178px
  text-align: center

>>>.avatar
  width: 178px
  height: 178px
  display: block
</style>
