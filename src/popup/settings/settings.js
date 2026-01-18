document.addEventListener('DOMContentLoaded', async function () {
  // Tab logic
  const tabBlockchain = document.getElementById('tab-blockchain-settings')
  const tabWebsites = document.getElementById('tab-websites')
  const tabContentBlockchain = document.getElementById('tab-content-blockchain')
  const tabContentWebsites = document.getElementById('tab-content-websites')

  tabBlockchain.addEventListener('click', function () {
    tabBlockchain.classList.add('active')
    tabWebsites.classList.remove('active')
    tabContentBlockchain.classList.remove('hidden')
    tabContentWebsites.classList.add('hidden')
  })
  tabWebsites.addEventListener('click', function () {
    tabWebsites.classList.add('active')
    tabBlockchain.classList.remove('active')
    tabContentWebsites.classList.remove('hidden')
    tabContentBlockchain.classList.add('hidden')
  })

  const saveSettingsBtn = document.getElementById('save-settings-btn')
  const privateKeyInput = document.getElementById('private-key-input')
  const chainNameInput = document.getElementById('chain-name-input')
  const chainIdInput = document.getElementById('chain-id-input')
  const chainRpcUrlInput = document.getElementById('chain-rpc-url-input')
  const backBtn = document.getElementById('settings-back-btn')

  const { THADAI_USER_PRIVATE_KEY, THADAI_CHAIN_NAME, THADAI_CHAIN_ID, THADAI_CHAIN_RPC_URL } =
    await chrome.storage.local.get([
      'THADAI_USER_PRIVATE_KEY',
      'THADAI_CHAIN_NAME',
      'THADAI_CHAIN_ID',
      'THADAI_CHAIN_RPC_URL',
    ])
  privateKeyInput.value = THADAI_USER_PRIVATE_KEY || ''
  chainNameInput.value = THADAI_CHAIN_NAME || ''
  chainIdInput.value = THADAI_CHAIN_ID || ''
  chainRpcUrlInput.value = THADAI_CHAIN_RPC_URL || ''

  saveSettingsBtn.addEventListener('click', async function () {
    const key = privateKeyInput.value.trim()
    const chainName = chainNameInput.value.trim()
    const chainId = chainIdInput.value.trim()
    const chainRpcUrl = chainRpcUrlInput.value.trim()
    if (!key || !isValidPrivateKey(key)) {
      alert('Please enter a valid private key.')
      return
    }
    if (!chainName) {
      alert('Please enter a chain name.')
      return
    }
    if (!chainId) {
      alert('Please enter a chain ID.')
      return
    }
    if (!chainRpcUrl) {
      alert('Please enter a chain RPC URL.')
      return
    }
    await chrome.storage.local.set({
      THADAI_USER_PRIVATE_KEY: key,
      THADAI_CHAIN_NAME: chainName,
      THADAI_CHAIN_ID: chainId,
      THADAI_CHAIN_RPC_URL: chainRpcUrl,
      THADAI_USER_SETTINGS_SET: true,
    })
    alert('Settings saved')
  })

  backBtn.addEventListener('click', function () {
    window.close()
    chrome.runtime.sendMessage({ type: 'OPEN_PU_FROM_SETTINGS' }, function (response) {})
  })

  // Managed websites logic
  const defaultWebsites = [
    'www.facebook.com',
    'www.instagram.com',
    'www.reddit.com',
    'www.youtube.com',
  ]
  const WEBSITES_KEY = 'THADAI_BLOCKED_WEBSITES'
  const blockedWebsitesList = document.getElementById('blocked-websites-list')
  const addWebsiteInput = document.getElementById('add-website-input')
  const addWebsiteBtn = document.getElementById('add-website-btn')

  // Helper to render the list
  function renderWebsitesList(websites) {
    blockedWebsitesList.innerHTML = ''
    if (!Array.isArray(websites) || websites.length === 0) {
      blockedWebsitesList.innerHTML = '<li style="color: #888;">No blocked websites</li>'
      return
    }
    websites.forEach((site) => {
      const li = document.createElement('li')
      li.textContent = site + ' '
      const removeBtn = document.createElement('button')
      removeBtn.textContent = 'Remove'
      removeBtn.className = 'remove-website-btn'
      removeBtn.addEventListener('click', async function () {
        const newList = websites.filter((w) => w !== site)
        await chrome.storage.local.set({ [WEBSITES_KEY]: newList })
        renderWebsitesList(newList)
      })
      li.appendChild(removeBtn)
      blockedWebsitesList.appendChild(li)
    })
  }

  // Load websites list (use default if not set)
  async function loadWebsitesList() {
    const result = await chrome.storage.local.get([WEBSITES_KEY])
    let websites = result[WEBSITES_KEY]
    if (!Array.isArray(websites)) {
      websites = defaultWebsites
      await chrome.storage.local.set({ [WEBSITES_KEY]: websites })
    }
    renderWebsitesList(websites)
  }

  // Add website
  addWebsiteBtn.addEventListener('click', async function () {
    const newSite = addWebsiteInput.value.trim()
    if (!newSite) return
    const result = await chrome.storage.local.get([WEBSITES_KEY])
    let websites = Array.isArray(result[WEBSITES_KEY]) ? result[WEBSITES_KEY] : []
    if (!websites.includes(newSite)) {
      websites.push(newSite)
      await chrome.storage.local.set({ [WEBSITES_KEY]: websites })
      renderWebsitesList(websites)
    }
    addWebsiteInput.value = ''
  })

  // Initial load
  loadWebsitesList()
})

function isValidPrivateKey(key) {
  // Must be a 0x-prefixed 64 hex chars (32 bytes)
  return typeof key === 'string' && /^0x[0-9a-fA-F]{64}$/.test(key)
}
