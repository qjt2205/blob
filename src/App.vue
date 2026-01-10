<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view />
    <n-back-top :right="50" :bottom="100" />
  </n-config-provider>
</template>

<script setup>
// 不需要额外的逻辑
import { NConfigProvider } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#2c3e50',
    primaryColorHover: '#4c5e70',
  },
  Select: {
    peers: {
      InternalSelection: {
        textColor: '#2c3e50',
        borderHover: '1px solid #2c3e50',
        borderFocus: '1px solid #2c3e50',
      },
    }
  },

  Button: {
    colorPrimaryHover: '#3498db',
  },

  Input: {
    borderHover: '1px solid #2c3e50',
    borderFocus: '1px solid #2c3e50',
    textColor: '#2c3e50',
  }
}
</script>

