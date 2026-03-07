# 图片资源说明

## 需要添加的图片

### 1. 个人头像
- 文件名：`avatar.jpg`
- 位置：`static/images/`
- 建议尺寸：400x400px
- 用途：关于页面展示

### 2. 微信二维码
- 文件名：`wechat-qr.jpg`
- 位置：`static/images/`
- 建议尺寸：400x400px
- 用途：页脚引流、联系页面

### 3. 舌诊案例照片
- 位置：`static/images/cases/`
- 命名格式：`case-{名称}-{编号}.jpg`
- 例如：`case-gallbladder-01.jpg`
- 要求：
  - 自然光拍摄
  - 关闭美颜
  - 聚焦清晰
  - 标注日期（避开舌体）

## 使用方法

在 Markdown 文件中引用图片：

```markdown
![舌象照片](/images/cases/case-gallbladder-01.jpg)
```

或 HTML：

```html
<img src="/images/cases/case-gallbladder-01.jpg" alt="舌象照片">
```
