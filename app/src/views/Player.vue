<template>
    <div class="container">
        <div style="height: 228px; width: 100%;">
              <iframe
                src="https://audio.com/embed/audio/1813634239204109?theme=image"
                style="display:block; border-radius: 1px; border: none; height: 204px; width: 100%;">
              </iframe>
          </div>
    </div>
</template>
<script>
export default {

}
</script>
<style scoped>  
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 950px;
    padding: 2rem;
    box-sizing: border-box;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  @media (max-width: 767px) {
    
    .container {
        width: 290px;
    }

}
</style>