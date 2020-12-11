<template>
  <div>
    <el-button type="primary" icon="el-icon-plus">添加</el-button>
    <!-- 主体表格 -->
    <el-table :data="tableData" border style="width: 100%; margin: 20px 0">
      <el-table-column prop="id" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="name" label="品牌名称"> </el-table-column>
      <el-table-column label="品牌LOGO" height='250'>
        <template slot-scope="scope">
          <img class="trademark-img" :src="scope.row.logo" alt="logo" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template>
          <el-button type="warning" icon="el-icon-edit">修改</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      class="trademark-pagination"
      :page-sizes="[10, 20, 40]"
      :page-size="10"
      layout="prev, pager, next, jumper, sizes, total"
      :total="100"
    >
    </el-pagination>

  </div>
</template>

<script>
export default {
  name: "TrademarkList",
  data() {
    return {
      tableData: [
        {
          id: 1,
          name: "CLOT",
          logo:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1607669238473&di=e7bced0b0de7b093f976cc28653cc658&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fforum%2Fw%3D580%2Fsign%3D8f7e7c00db43ad4ba62e46c8b2035a89%2F5a3b3d12b31bb051ae54328d3c7adab44bede0f4.jpg',
        },
      ],
    };
  },
};
</script>

<style lang="sass">
.trademark-img
  width: 150px
.trademark-pagination
  text-align: right
.el-pagination__sizes
  margin-left: 550px
</style>
