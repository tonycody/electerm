
import { useRef } from 'react'
import { Button, Input, message, Upload, Form } from 'antd'
import { convertTheme, convertThemeToText, exportTheme } from '../../common/terminal-theme'
import { defaultTheme } from '../../common/constants'
import { generate } from 'shortid'
import { formItemLayout, tailFormItemLayout } from '../../common/form-layout'
import InputAutoFocus from '../common/input-auto-focus'

const { TextArea } = Input
const FormItem = Form.Item
const { prefix } = window
const e = prefix('form')
const s = prefix('setting')
const t = prefix('terminalThemes')

export default function ThemeForm (props) {
  const [form] = Form.useForm()
  const action = useRef('submit')
  function exporter () {
    exportTheme(props.formData.id)
  }
  function saveOnly () {
    action.current = 'saveOnly'
    form.submit()
  }
  async function handleSubmit (res) {
    const { formData } = props
    const {
      themeName,
      themeText
    } = res
    const update = {
      name: themeName,
      themeConfig: convertTheme(themeText).themeConfig
    }
    const update1 = {
      ...update,
      id: generate()
    }
    if (formData.id) {
      props.store.editTheme(formData.id, update)
    } else {
      props.store.addTheme(update1)
      props.store.storeAssign({
        item: update1
      })
    }
    if (action.current !== 'saveOnly') {
      props.store.setTheme(
        formData.id || update1.id
      )
    }
    message.success(s('saved'))
    action.current = 'submit'
  }

  function beforeUpload (file) {
    const txt = window.getGlobal('fs')
      .readFileSync(file.path).toString()
    const { name, themeConfig } = convertTheme(txt)
    form.setFieldsValue({
      themeName: name,
      themeText: convertThemeToText({
        name, themeConfig
      })
    })
    return false
  }

  const {
    themeConfig,
    id,
    name: themeName
  } = props.formData
  const initialValues = {
    themeName,
    themeText: convertThemeToText({ themeConfig, name: themeName })
  }
  const { autofocustrigger } = props.store
  const isDefaultTheme = id === defaultTheme.id
  return (
    <Form
      onFinish={handleSubmit}
      form={form}
      initialValues={initialValues}
      className='form-wrap'
      name='terminal-theme-form'
    >
      <FormItem {...tailFormItemLayout}>
        {
          id
            ? (
              <Button
                type='ghost'
                onClick={exporter}
              >{t('export')}</Button>
            )
            : null
        }
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={t('themeName')}
        hasFeedback
        name='themeName'
        rules={[{
          max: 30, message: '30 chars max'
        }, {
          required: true, message: 'theme name required'
        }]}
      >
        <InputAutoFocus
          selectall='true'
          disabled={isDefaultTheme}
          autofocustrigger={autofocustrigger}
        />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={t('themeConfig')}
        rules={[{
          max: 1000, message: '1000 chars max'
        }, {
          required: true, message: 'theme Config required'
        }]}
      >
        <FormItem noStyle name='themeText'>
          <TextArea rows={18} disabled={isDefaultTheme} />
        </FormItem>
        <div className='pd1t'>
          <Upload
            beforeUpload={beforeUpload}
            fileList={[]}
            className='mg1b'
          >
            <Button
              type='ghost'
              disabled={isDefaultTheme}
            >
              {e('importFromFile')}
            </Button>
          </Upload>
        </div>
      </FormItem>
      {
        isDefaultTheme
          ? null
          : (
            <FormItem {...tailFormItemLayout}>
              <p>
                <Button
                  type='primary'
                  htmlType='submit'
                  className='mg1r mg1b'
                >{t('saveAndApply')}</Button>
                <Button
                  type='ghost'
                  className='mg1r mg1b'
                  onClick={saveOnly}
                >{e('save')}</Button>
              </p>
            </FormItem>
          )
      }
    </Form>
  )
}
