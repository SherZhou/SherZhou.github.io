---
title: PR流程
top: false
cover: false
toc: true
mathjax: true
date: 2022-10-04 23:23:16
password:
summary:
tags:git
categories:java
---

ps: 本次操作以Seata为源仓库

### 三阶段

![img](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658886093327-e4f54f3e-47e6-494f-acfb-ed3bb0ea768e.jpeg)



### 准备仓库

#### fork项目

进入源项目页面，点击右上角Fork按钮

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658888621847-879f79fc-a17c-499b-b5ca-42006d34ddbf-16588931386535-165889350667013.png)

会自动生成以自己名称命名的项目

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658888505200-c951bc7d-18cd-48fe-89f6-c557a45ed51d-165889350975115.png)

#### clone到本地

即将自己名称下的项目下载到本地
![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658889063492-78b17270-fd3b-468f-aced-3199adb2872a.png)

```powershell
git clone https://github.com/(your_github_name)/(upstream_project_name).git
cd upstream_project_name
```

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658889091140-634fb3a9-e8c5-4ba2-b05a-c635a40b9449-16588932048249-165889351770819.png)

#### 设置remote

与源远程仓库建立联系

```powershell
git remote add upstream https://github.com/...(source_project_address)
```

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658889446085-e867c55a-dcd5-4b78-af41-58631e011463.png)
查看联系

```powershell
git remote -v
```

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658889385032-1ada811c-56dd-4d54-a3da-533cd3544e06.png)
可以看到自己的仓库地址(`origin `)与源仓库地址(` upstream `)

#### 编译项目（非必须）

编译并安装所有模块到Maven本地仓库缓存，同时会生成ANTLR.g4语法文件对应的解析器Java类，这样在IDE就不会有相关编译错误。

```powershell
cd upstream_project_name
#我一般只跳过checkstyle和Tests
mvn clean install -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Drat.skip=true -Djacoco.skip=true -DskipITs -DskipTests -Prelease
```

以后从源文件拉去最新代码并新建分支时可能会遇到类似解析器编译错误，可以重新运行该命令来解决问题。

#### 创建分支

用于开发

```powershell
#切换本地分支（切换分支到develop）
git checkout upstream develop

# 将更新源远程repo(upstream)所包含develop分支的最新commit-id, 将其记录到.git/FETCH_HEAD文件中
git fetch upstream

#改变基底，类似与git merge 但源仓库有最新提交时两者间有区别
git rebase upstream/master

# 将代码push到自己名称下仓库(origin)的master分支
git push origin master

#查看当前所在分支
git branch

#创建新的本地分支，并切换到新分支(同原分支)
git checkout -b your_branch

#新产生远程分支your_branch并将本地your_branch分支关联到远程your_branch分支
git push origin your_branch:your_branch
```

PR会按照squash方式进行merge。如果不创建新分支，本地和远程的提交记录将不能保持同步
ps: 方便id显示在contributor列表中可以做以下设置

```powershell
git config --global your.name"username"
git congig --global your.email"xxx@mail.com"
```

### 开发 

#### 修改代码，保存修改，推送到自己的远程仓库

```powershell
#保存修改到暂存区
git add 
#将暂存区内容添加到本地仓库
git commit -m"commit log"
#推送到自己的远程仓库
git push origin your_branch
```

### 提交PR

发出一个pull request到 upstream develop分支
![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1658891906292-4ef51083-3d12-4ca8-afe3-6c7f3c17efe1.png)
填写标题和内容点击确认
之后导师会进行代码复核工作，满意后导师会将其合并到源分支

#### 删除分支

```powershell
git checkout master
git branch -d your_branch
git remote prune origin #如果已经在GitHub PR页面删除了分支，否则可以执行下面命令删除
git push origin --delete your_branch
```



### 参考

https://blog.csdn.net/qq_33429968/article/details/62219783?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-62219783-blog-116944619.pc_relevant_multi_platform_whitelistv2&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1-62219783-blog-116944619.pc_relevant_multi_platform_whitelistv2&utm_relevant_index=1

https://learngitbranching.js.org/?locale=zh_CN



